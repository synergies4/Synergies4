-- Create a timestamp function that returns int8 with STABLE volatility
CREATE OR REPLACE FUNCTION current_epoch() 
RETURNS bigint AS $$
/*
Returns the current timestamp as Unix epoch (seconds since 1970-01-01)
*/
BEGIN
  RETURN EXTRACT(EPOCH FROM NOW())::bigint;
END;
$$ LANGUAGE plpgsql VOLATILE;


