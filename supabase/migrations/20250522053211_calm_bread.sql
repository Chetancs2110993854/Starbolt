/*
  # Initial Schema Setup

  1. New Tables
    - `users`
      - Stores user information and authentication
      - Links to Supabase Auth
    - `orders`
      - Stores client orders and their status
    - `review_tasks`
      - Individual review tasks for interns
      - Links to orders and tracks completion
    - `review_proofs`
      - Stores proof submissions for completed reviews

  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
*/

-- Users table extending Supabase auth
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'client', 'intern')),
  business_name text,
  phone text,
  phone_verified boolean DEFAULT false,
  commission_earned decimal(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES users(id) NOT NULL,
  business_url text NOT NULL,
  business_name text NOT NULL,
  package_id text NOT NULL,
  total_reviews integer NOT NULL,
  completed_reviews integer DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Review tasks table
CREATE TABLE IF NOT EXISTS review_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) NOT NULL,
  intern_id uuid REFERENCES users(id),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'submitted', 'approved', 'rejected')),
  commission decimal(10,2) NOT NULL,
  guidelines text[] NOT NULL,
  assigned_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE review_tasks ENABLE ROW LEVEL SECURITY;

-- Review proofs table
CREATE TABLE IF NOT EXISTS review_proofs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES review_tasks(id) NOT NULL,
  intern_id uuid REFERENCES users(id) NOT NULL,
  screenshot_url text NOT NULL,
  review_content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE review_proofs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Orders policies
CREATE POLICY "Clients can read own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Admins can read all orders"
  ON orders
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  ));

-- Review tasks policies
CREATE POLICY "Interns can read and claim available tasks"
  ON review_tasks
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'intern'
    )
    AND (
      intern_id IS NULL
      OR intern_id = auth.uid()
    )
  );

-- Review proofs policies
CREATE POLICY "Interns can submit proofs for their tasks"
  ON review_proofs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    intern_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM review_tasks
      WHERE review_tasks.id = task_id
      AND review_tasks.intern_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own proofs"
  ON review_proofs
  FOR SELECT
  TO authenticated
  USING (intern_id = auth.uid());

ALTER TABLE users ADD COLUMN email text NOT NULL;
