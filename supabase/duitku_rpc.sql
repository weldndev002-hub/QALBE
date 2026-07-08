CREATE OR REPLACE FUNCTION public.handle_duitku_webhook(
  p_merchant_order_id TEXT,
  p_reference TEXT,
  p_status TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_tier_id INTEGER;
BEGIN
  IF p_status = 'SUCCESS' THEN
    -- Cari transaksi pending di membership_history
    SELECT user_id, to_tier_id INTO v_user_id, v_tier_id
    FROM public.membership_history
    WHERE payment_ref = p_merchant_order_id AND change_type = 'pending_payment'
    LIMIT 1;

    IF v_user_id IS NOT NULL THEN
      -- 1. Update status di user_memberships menjadi aktif 30 hari
      INSERT INTO public.user_memberships (user_id, tier_id, status, started_at, expires_at, notes, updated_at)
      VALUES (
        v_user_id, 
        v_tier_id, 
        'active', 
        NOW(), 
        NOW() + INTERVAL '30 days', 
        'Pembayaran Duitku Sukses', 
        NOW()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        tier_id = EXCLUDED.tier_id,
        status = EXCLUDED.status,
        started_at = EXCLUDED.started_at,
        expires_at = EXCLUDED.expires_at,
        notes = EXCLUDED.notes,
        updated_at = EXCLUDED.updated_at;

      -- 2. Ubah status history menjadi sukses
      UPDATE public.membership_history
      SET change_type = 'upgrade', reason = 'Pembayaran Berhasil: ' || p_reference
      WHERE payment_ref = p_merchant_order_id AND change_type = 'pending_payment';
    END IF;
  ELSE
    -- Jika gagal, ubah status history
    UPDATE public.membership_history
    SET change_type = 'payment_failed', reason = 'Pembayaran Gagal/Expired'
    WHERE payment_ref = p_merchant_order_id AND change_type = 'pending_payment';
  END IF;
END;
$$;
