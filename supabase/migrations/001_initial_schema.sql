-- EventHub Initial Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS (extends Supabase Auth)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  template TEXT NOT NULL DEFAULT 'housewarming',
  cover_image TEXT,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  timezone TEXT DEFAULT 'Asia/Kolkata',
  venue_name TEXT,
  address TEXT,
  map_url TEXT,
  host_name TEXT,
  enable_rsvp BOOLEAN DEFAULT TRUE,
  enable_guest_count BOOLEAN DEFAULT TRUE,
  enable_wishes BOOLEAN DEFAULT TRUE,
  enable_photo_uploads BOOLEAN DEFAULT FALSE,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- GALLERY IMAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RSVPs
-- ============================================================
CREATE TABLE IF NOT EXISTS public.rsvps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status TEXT NOT NULL CHECK (status IN ('attending', 'not_attending', 'maybe')) DEFAULT 'attending',
  guest_count INTEGER DEFAULT 1,
  notes TEXT,
  checked_in BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_rsvp_email UNIQUE (event_id, email),
  CONSTRAINT unique_rsvp_phone UNIQUE (event_id, phone)
);

-- ============================================================
-- WISHES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.wishes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- QR CODES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.qr_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  rsvp_id UUID NOT NULL REFERENCES public.rsvps(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  checked_in BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_qr_per_rsvp UNIQUE (event_id, rsvp_id)
);

-- ============================================================
-- REMINDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  rsvp_id UUID REFERENCES public.rsvps(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('7_days', '1_day', 'event_day', 'custom')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATION LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  rsvp_id UUID REFERENCES public.rsvps(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('rsvp_confirmation', 'reminder', 'qr_pass', 'custom')),
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'sms', 'email', 'push')),
  provider TEXT,
  recipient_phone TEXT,
  recipient_email TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'delivered', 'failed')) DEFAULT 'pending',
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VISITOR PASSES (MyGate / Gate integration)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.visitor_passes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  rsvp_id UUID NOT NULL REFERENCES public.rsvps(id) ON DELETE CASCADE,
  pass_code TEXT UNIQUE NOT NULL,
  visitor_name TEXT NOT NULL,
  vehicle_number TEXT,
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'used', 'expired', 'cancelled')) DEFAULT 'active',
  provider TEXT CHECK (provider IN ('mygate', 'nobrokerhood', 'manual')) DEFAULT 'manual',
  external_pass_id TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_pass_per_rsvp UNIQUE (event_id, rsvp_id)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_events_user_id ON public.events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_gallery_images_event_id ON public.gallery_images(event_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_event_id ON public.rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_status ON public.rsvps(status);
CREATE INDEX IF NOT EXISTS idx_wishes_event_id ON public.wishes(event_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_code ON public.qr_codes(code);
CREATE INDEX IF NOT EXISTS idx_qr_codes_event_id ON public.qr_codes(event_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_event_id ON public.notification_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_visitor_passes_event_id ON public.visitor_passes(event_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_passes ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only read/write their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Events: hosts manage their events, public can read published events
CREATE POLICY "Hosts manage own events" ON public.events
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public can view published events" ON public.events
  FOR SELECT USING (published = TRUE);

-- Gallery images: hosts manage, public can view via published events
CREATE POLICY "Hosts manage gallery" ON public.gallery_images
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND user_id = auth.uid())
  );
CREATE POLICY "Public can view gallery" ON public.gallery_images
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND published = TRUE)
  );

-- RSVPs: hosts can manage, guests can insert
CREATE POLICY "Hosts manage rsvps" ON public.rsvps
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND user_id = auth.uid())
  );
CREATE POLICY "Anyone can submit rsvp" ON public.rsvps
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND published = TRUE AND enable_rsvp = TRUE)
  );

-- Wishes: hosts manage, guests can insert to published events
CREATE POLICY "Hosts manage wishes" ON public.wishes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND user_id = auth.uid())
  );
CREATE POLICY "Anyone can submit wish" ON public.wishes
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND published = TRUE AND enable_wishes = TRUE)
  );
CREATE POLICY "Public can view approved wishes" ON public.wishes
  FOR SELECT USING (
    approved = TRUE AND EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND published = TRUE)
  );

-- QR codes: hosts manage, guests can view their own
CREATE POLICY "Hosts manage qr codes" ON public.qr_codes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND user_id = auth.uid())
  );
CREATE POLICY "Public can view qr codes" ON public.qr_codes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND published = TRUE)
  );

-- Reminders: hosts only
CREATE POLICY "Hosts manage reminders" ON public.reminders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND user_id = auth.uid())
  );

-- Notification logs: hosts only
CREATE POLICY "Hosts view notification logs" ON public.notification_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND user_id = auth.uid())
  );

-- Visitor passes: hosts manage, guests view
CREATE POLICY "Hosts manage visitor passes" ON public.visitor_passes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND user_id = auth.uid())
  );
CREATE POLICY "Public can view visitor passes" ON public.visitor_passes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND published = TRUE)
  );

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-media', 'event-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view event media" ON storage.objects
  FOR SELECT USING (bucket_id = 'event-media');

CREATE POLICY "Authenticated users can upload event media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'event-media' AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own event media" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'event-media' AND auth.uid() = owner
  );

CREATE POLICY "Users can delete their own event media" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'event-media' AND auth.uid() = owner
  );

-- ============================================================
-- TRIGGERS: auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TRIGGERS: updated_at auto-update
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_rsvps_updated_at
  BEFORE UPDATE ON public.rsvps
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
