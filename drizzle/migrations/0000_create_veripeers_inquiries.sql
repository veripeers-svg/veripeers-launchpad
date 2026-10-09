CREATE TABLE public.veripeers_inquiries (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 kind text NOT NULL CHECK (kind IN ('registration', 'partnership')),
 name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 100),
 email text NOT NULL CHECK (char_length(email) <= 254),
 details jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.veripeers_inquiries TO anon;
GRANT ALL ON public.veripeers_inquiries TO service_role;
ALTER TABLE public.veripeers_inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public may submit inquiries only" ON public.veripeers_inquiries FOR INSERT TO anon WITH CHECK (kind IN ('registration','partnership') AND char_length(name) BETWEEN 2 AND 100 AND char_length(email) <= 254);
