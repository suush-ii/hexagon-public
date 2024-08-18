-- Custom SQL migration file, put you code below! --
-- migrate game names to places like they should be lmao
UPDATE public.places
SET
  placename = g.gamename
FROM
  public.games g
WHERE
  places.universeid = g.universeid;