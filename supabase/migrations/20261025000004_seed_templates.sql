-- ==============================================================================
-- CertiVault Migration: Seed 8 Platform Preset Templates (Work 6)
-- Presets are global records with org_id is null.
-- All presets include mandatory 'id' and 'qr' fields.
-- ==============================================================================

-- 1. Classic Academic (A4 Landscape)
insert into public.templates (name, page_size, field_keys, schema)
values (
  'Classic Academic',
  'A4-landscape',
  array['recipient_name', 'title', 'date', 'signatory_name', 'signatory_title', 'id', 'qr'],
  '{
    "basePdf": {"width": 297, "height": 210, "padding": [10, 10, 10, 10]},
    "schemas": [[
      {"name": "org_name", "type": "text", "position": {"x": 20, "y": 25}, "width": 257, "height": 12, "alignment": "center", "fontSize": 16, "fontName": "Inter"},
      {"name": "header", "type": "text", "position": {"x": 20, "y": 40}, "width": 257, "height": 18, "alignment": "center", "fontSize": 26, "fontName": "PlayfairDisplay"},
      {"name": "recipient_name", "type": "text", "position": {"x": 20, "y": 72}, "width": 257, "height": 22, "alignment": "center", "fontSize": 32, "fontName": "PlayfairDisplay"},
      {"name": "title", "type": "text", "position": {"x": 30, "y": 102}, "width": 237, "height": 18, "alignment": "center", "fontSize": 14, "fontName": "Inter"},
      {"name": "date", "type": "text", "position": {"x": 30, "y": 155}, "width": 70, "height": 10, "alignment": "left", "fontSize": 11, "fontName": "Inter"},
      {"name": "signatory_name", "type": "text", "position": {"x": 190, "y": 155}, "width": 80, "height": 10, "alignment": "right", "fontSize": 11, "fontName": "Inter"},
      {"name": "qr", "type": "qrcode", "position": {"x": 133, "y": 150}, "width": 30, "height": 30},
      {"name": "id", "type": "text", "position": {"x": 98, "y": 185}, "width": 100, "height": 8, "alignment": "center", "fontSize": 9, "fontName": "Inter"}
    ]]
  }'::jsonb
)
on conflict do nothing;

-- 2. Modern Minimalist (A4 Landscape)
insert into public.templates (name, page_size, field_keys, schema)
values (
  'Modern Minimalist',
  'A4-landscape',
  array['recipient_name', 'title', 'date', 'id', 'qr'],
  '{
    "basePdf": {"width": 297, "height": 210, "padding": [10, 10, 10, 10]},
    "schemas": [[
      {"name": "header", "type": "text", "position": {"x": 25, "y": 35}, "width": 247, "height": 15, "alignment": "left", "fontSize": 22, "fontName": "Inter"},
      {"name": "recipient_name", "type": "text", "position": {"x": 25, "y": 65}, "width": 247, "height": 25, "alignment": "left", "fontSize": 34, "fontName": "Inter"},
      {"name": "title", "type": "text", "position": {"x": 25, "y": 98}, "width": 247, "height": 20, "alignment": "left", "fontSize": 14, "fontName": "Inter"},
      {"name": "date", "type": "text", "position": {"x": 25, "y": 160}, "width": 80, "height": 10, "alignment": "left", "fontSize": 11, "fontName": "Inter"},
      {"name": "qr", "type": "qrcode", "position": {"x": 240, "y": 150}, "width": 32, "height": 32},
      {"name": "id", "type": "text", "position": {"x": 205, "y": 185}, "width": 67, "height": 8, "alignment": "right", "fontSize": 8, "fontName": "Inter"}
    ]]
  }'::jsonb
)
on conflict do nothing;

-- 3. Corporate Accreditation (A4 Landscape)
insert into public.templates (name, page_size, field_keys, schema)
values (
  'Corporate Accreditation',
  'A4-landscape',
  array['recipient_name', 'title', 'date', 'id', 'qr'],
  '{
    "basePdf": {"width": 297, "height": 210, "padding": [10, 10, 10, 10]},
    "schemas": [[
      {"name": "header", "type": "text", "position": {"x": 20, "y": 30}, "width": 257, "height": 16, "alignment": "center", "fontSize": 24, "fontName": "Inter"},
      {"name": "recipient_name", "type": "text", "position": {"x": 20, "y": 68}, "width": 257, "height": 24, "alignment": "center", "fontSize": 30, "fontName": "Inter"},
      {"name": "title", "type": "text", "position": {"x": 20, "y": 100}, "width": 257, "height": 16, "alignment": "center", "fontSize": 13, "fontName": "Inter"},
      {"name": "date", "type": "text", "position": {"x": 25, "y": 160}, "width": 80, "height": 10, "alignment": "left", "fontSize": 10, "fontName": "Inter"},
      {"name": "qr", "type": "qrcode", "position": {"x": 133, "y": 145}, "width": 30, "height": 30},
      {"name": "id", "type": "text", "position": {"x": 108, "y": 180}, "width": 80, "height": 8, "alignment": "center", "fontSize": 9, "fontName": "Inter"}
    ]]
  }'::jsonb
)
on conflict do nothing;

-- 4. Bold Hackathon (A4 Landscape)
insert into public.templates (name, page_size, field_keys, schema)
values (
  'Bold Hackathon',
  'A4-landscape',
  array['recipient_name', 'title', 'position', 'date', 'id', 'qr'],
  '{
    "basePdf": {"width": 297, "height": 210, "padding": [10, 10, 10, 10]},
    "schemas": [[
      {"name": "header", "type": "text", "position": {"x": 20, "y": 25}, "width": 257, "height": 18, "alignment": "center", "fontSize": 28, "fontName": "Inter"},
      {"name": "recipient_name", "type": "text", "position": {"x": 20, "y": 65}, "width": 257, "height": 25, "alignment": "center", "fontSize": 36, "fontName": "Inter"},
      {"name": "position", "type": "text", "position": {"x": 20, "y": 95}, "width": 257, "height": 15, "alignment": "center", "fontSize": 16, "fontName": "Inter"},
      {"name": "title", "type": "text", "position": {"x": 20, "y": 115}, "width": 257, "height": 15, "alignment": "center", "fontSize": 13, "fontName": "Inter"},
      {"name": "qr", "type": "qrcode", "position": {"x": 20, "y": 155}, "width": 28, "height": 28},
      {"name": "id", "type": "text", "position": {"x": 52, "y": 168}, "width": 100, "height": 8, "alignment": "left", "fontSize": 9, "fontName": "Inter"},
      {"name": "date", "type": "text", "position": {"x": 197, "y": 168}, "width": 80, "height": 10, "alignment": "right", "fontSize": 10, "fontName": "Inter"}
    ]]
  }'::jsonb
)
on conflict do nothing;

-- 5. Workshop Completion (A4 Landscape)
insert into public.templates (name, page_size, field_keys, schema)
values (
  'Workshop Completion',
  'A4-landscape',
  array['recipient_name', 'title', 'date', 'id', 'qr'],
  '{
    "basePdf": {"width": 297, "height": 210, "padding": [10, 10, 10, 10]},
    "schemas": [[
      {"name": "header", "type": "text", "position": {"x": 20, "y": 35}, "width": 257, "height": 16, "alignment": "center", "fontSize": 22, "fontName": "Inter"},
      {"name": "recipient_name", "type": "text", "position": {"x": 20, "y": 70}, "width": 257, "height": 22, "alignment": "center", "fontSize": 28, "fontName": "Inter"},
      {"name": "title", "type": "text", "position": {"x": 25, "y": 102}, "width": 247, "height": 18, "alignment": "center", "fontSize": 13, "fontName": "Inter"},
      {"name": "date", "type": "text", "position": {"x": 25, "y": 160}, "width": 80, "height": 10, "alignment": "left", "fontSize": 10, "fontName": "Inter"},
      {"name": "qr", "type": "qrcode", "position": {"x": 242, "y": 152}, "width": 30, "height": 30},
      {"name": "id", "type": "text", "position": {"x": 185, "y": 185}, "width": 87, "height": 8, "alignment": "right", "fontSize": 8, "fontName": "Inter"}
    ]]
  }'::jsonb
)
on conflict do nothing;

-- 6. Internship Certificate (A4 Landscape)
insert into public.templates (name, page_size, field_keys, schema)
values (
  'Internship Certificate',
  'A4-landscape',
  array['recipient_name', 'title', 'date', 'id', 'qr'],
  '{
    "basePdf": {"width": 297, "height": 210, "padding": [10, 10, 10, 10]},
    "schemas": [[
      {"name": "header", "type": "text", "position": {"x": 20, "y": 30}, "width": 257, "height": 16, "alignment": "center", "fontSize": 24, "fontName": "Inter"},
      {"name": "recipient_name", "type": "text", "position": {"x": 20, "y": 68}, "width": 257, "height": 22, "alignment": "center", "fontSize": 28, "fontName": "Inter"},
      {"name": "title", "type": "text", "position": {"x": 30, "y": 98}, "width": 237, "height": 25, "alignment": "center", "fontSize": 13, "fontName": "Inter"},
      {"name": "qr", "type": "qrcode", "position": {"x": 133, "y": 145}, "width": 30, "height": 30},
      {"name": "id", "type": "text", "position": {"x": 98, "y": 180}, "width": 100, "height": 8, "alignment": "center", "fontSize": 8, "fontName": "Inter"},
      {"name": "date", "type": "text", "position": {"x": 25, "y": 160}, "width": 80, "height": 10, "alignment": "left", "fontSize": 10, "fontName": "Inter"}
    ]]
  }'::jsonb
)
on conflict do nothing;

-- 7. Academic Portrait (A4 Portrait)
insert into public.templates (name, page_size, field_keys, schema)
values (
  'Academic Portrait',
  'A4-portrait',
  array['recipient_name', 'title', 'date', 'id', 'qr'],
  '{
    "basePdf": {"width": 210, "height": 297, "padding": [10, 10, 10, 10]},
    "schemas": [[
      {"name": "header", "type": "text", "position": {"x": 15, "y": 50}, "width": 180, "height": 20, "alignment": "center", "fontSize": 26, "fontName": "PlayfairDisplay"},
      {"name": "recipient_name", "type": "text", "position": {"x": 15, "y": 95}, "width": 180, "height": 25, "alignment": "center", "fontSize": 30, "fontName": "PlayfairDisplay"},
      {"name": "title", "type": "text", "position": {"x": 20, "y": 135}, "width": 170, "height": 30, "alignment": "center", "fontSize": 14, "fontName": "Inter"},
      {"name": "qr", "type": "qrcode", "position": {"x": 90, "y": 220}, "width": 30, "height": 30},
      {"name": "id", "type": "text", "position": {"x": 55, "y": 255}, "width": 100, "height": 8, "alignment": "center", "fontSize": 9, "fontName": "Inter"},
      {"name": "date", "type": "text", "position": {"x": 20, "y": 230}, "width": 60, "height": 10, "alignment": "left", "fontSize": 10, "fontName": "Inter"}
    ]]
  }'::jsonb
)
on conflict do nothing;

-- 8. Achievement Award Portrait (A4 Portrait)
insert into public.templates (name, page_size, field_keys, schema)
values (
  'Achievement Award Portrait',
  'A4-portrait',
  array['recipient_name', 'title', 'position', 'date', 'id', 'qr'],
  '{
    "basePdf": {"width": 210, "height": 297, "padding": [10, 10, 10, 10]},
    "schemas": [[
      {"name": "header", "type": "text", "position": {"x": 15, "y": 45}, "width": 180, "height": 20, "alignment": "center", "fontSize": 26, "fontName": "PlayfairDisplay"},
      {"name": "recipient_name", "type": "text", "position": {"x": 15, "y": 90}, "width": 180, "height": 25, "alignment": "center", "fontSize": 32, "fontName": "Inter"},
      {"name": "position", "type": "text", "position": {"x": 15, "y": 125}, "width": 180, "height": 15, "alignment": "center", "fontSize": 16, "fontName": "Inter"},
      {"name": "title", "type": "text", "position": {"x": 20, "y": 145}, "width": 170, "height": 25, "alignment": "center", "fontSize": 13, "fontName": "Inter"},
      {"name": "qr", "type": "qrcode", "position": {"x": 90, "y": 220}, "width": 30, "height": 30},
      {"name": "id", "type": "text", "position": {"x": 55, "y": 255}, "width": 100, "height": 8, "alignment": "center", "fontSize": 9, "fontName": "Inter"},
      {"name": "date", "type": "text", "position": {"x": 20, "y": 230}, "width": 60, "height": 10, "alignment": "left", "fontSize": 10, "fontName": "Inter"}
    ]]
  }'::jsonb
)
on conflict do nothing;
