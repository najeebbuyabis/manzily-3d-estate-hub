-- Update the current user's role to admin
UPDATE public.profiles 
SET role = 'admin' 
WHERE user_id = 'b8931247-46ff-49f3-be1f-cfc0f3e560b1';