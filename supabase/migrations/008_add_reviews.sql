CREATE TYPE review_status AS ENUM ('public', 'hidden');

CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.user_accounts(id) ON DELETE CASCADE,
    garment_id UUID NOT NULL REFERENCES public.garments(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    
    rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    
    status review_status DEFAULT 'public'::review_status,
    
    -- Staff interaction
    staff_reply TEXT,
    staff_reply_at TIMESTAMPTZ(6),
    staff_replied_by UUID REFERENCES public.user_accounts(id),
    
    -- Reporting to manager
    is_reported BOOLEAN DEFAULT false,
    reported_reason TEXT,
    reported_at TIMESTAMPTZ(6),
    reported_by UUID REFERENCES public.user_accounts(id),
    
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    
    UNIQUE(customer_id, garment_id, booking_id)
);
