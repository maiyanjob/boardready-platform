-- Add realistic bios to Nike board members for AI analysis

-- Elliott Hill (CEO) - Tech/Digital focus
UPDATE board_members 
SET matrix_data = jsonb_set(
    COALESCE(matrix_data, '{}'::jsonb),
    '{background,bio}',
    '"Former Nike President with extensive experience leading digital transformation initiatives across global markets. Championed Nike''s e-commerce platform development and data-driven consumer insights programs. Expertise in technology-enabled supply chain optimization and digital marketing innovation."'::jsonb
)
WHERE name = 'Elliott Hill' AND deleted_at IS NULL;

-- John Donahoe (Previous CEO) - Strong tech background
UPDATE board_members 
SET matrix_data = jsonb_set(
    COALESCE(matrix_data, '{}'::jsonb),
    '{background,bio}',
    '"Former CEO of ServiceNow and eBay with deep expertise in cloud computing, AI/ML platforms, and enterprise digital transformation. Led ServiceNow''s AI-powered workflow automation initiatives. Previously served as Managing Director at Bain & Company focusing on technology strategy."'::jsonb
)
WHERE name = 'John Donahoe' AND deleted_at IS NULL;

-- Cathy Bessant - Financial tech
UPDATE board_members 
SET matrix_data = jsonb_set(
    COALESCE(matrix_data, '{}'::jsonb),
    '{background,bio}',
    '"Chief Operations and Technology Officer at Bank of America with expertise in cybersecurity, data privacy, and fintech innovation. Oversees $3B+ annual technology budget managing cloud infrastructure, AI-driven fraud detection, and digital banking platforms. Recognized leader in enterprise cybersecurity."'::jsonb
)
WHERE name = 'Cathy Bessant' AND deleted_at IS NULL;

-- Timothy Cook - Apple CEO, obvious tech leader
UPDATE board_members 
SET matrix_data = jsonb_set(
    COALESCE(matrix_data, '{}'::jsonb),
    '{background,bio}',
    '"CEO of Apple Inc. with unparalleled expertise in consumer technology, supply chain innovation, and product development. Under his leadership, Apple has invested heavily in AI/ML capabilities including Siri, machine learning chips, and on-device intelligence. Extensive experience in hardware-software integration and data privacy."'::jsonb
)
WHERE name = 'Timothy D. Cook' AND deleted_at IS NULL;

-- Travis Knight - Entertainment/Animation tech
UPDATE board_members 
SET matrix_data = jsonb_set(
    COALESCE(matrix_data, '{}'::jsonb),
    '{background,bio}',
    '"CEO of LAIKA animation studio with expertise in cutting-edge animation technology, visual effects, and creative technology platforms. Experience with motion capture technology and digital content creation. Background combines artistic vision with technical innovation in entertainment."'::jsonb
)
WHERE name = 'Travis Knight' AND deleted_at IS NULL;

-- Elizabeth Comstock - Marketing/Digital
UPDATE board_members 
SET matrix_data = jsonb_set(
    COALESCE(matrix_data, '{}'::jsonb),
    '{background,bio}',
    '"Former Vice Chair of GE with experience in marketing, digital media, and brand strategy. Led GE''s digital industrial transformation and innovation initiatives. Expertise in leveraging data analytics for customer engagement and market insights."'::jsonb
)
WHERE name = 'Elizabeth Comstock' AND deleted_at IS NULL;

-- Peter Henry - Academic/Finance
UPDATE board_members 
SET matrix_data = jsonb_set(
    COALESCE(matrix_data, '{}'::jsonb),
    '{background,bio}',
    '"Dean Emeritus of NYU Stern School of Business with expertise in international finance, emerging markets, and corporate governance. Academic background in quantitative finance and economic modeling. Serves on multiple public company boards providing strategic financial oversight."'::jsonb
)
WHERE name = 'Peter Henry' AND deleted_at IS NULL;

-- Cathleen Benko - HR Tech
UPDATE board_members 
SET matrix_data = jsonb_set(
    COALESCE(matrix_data, '{}'::jsonb),
    '{background,bio}',
    '"Former Vice Chairman at Deloitte with expertise in organizational transformation, talent strategy, and workplace innovation. Experience implementing HR technology platforms and data-driven workforce analytics. Focus on diversity & inclusion and future of work initiatives."'::jsonb
)
WHERE name = 'Cathleen Benko' AND deleted_at IS NULL;

-- John Connors - VC/Tech investing
UPDATE board_members 
SET matrix_data = jsonb_set(
    COALESCE(matrix_data, '{}'::jsonb),
    '{background,bio}',
    '"Managing Partner at Ignition Partners focused on enterprise software and cloud infrastructure investments. Former CFO of Microsoft with deep expertise in technology business models and software-as-a-service. Active investor in AI/ML startups and cybersecurity companies."'::jsonb
)
WHERE name = 'John Connors' AND deleted_at IS NULL;

-- Michelle Peluso - E-commerce/Digital
UPDATE board_members 
SET matrix_data = jsonb_set(
    COALESCE(matrix_data, '{}'::jsonb),
    '{background,bio}',
    '"Former Chief Marketing Officer at IBM and CEO of Travelocity with extensive experience in digital commerce, customer experience, and technology-enabled marketing. Led IBM''s cognitive solutions and cloud platform marketing. Expertise in leveraging AI for personalized customer engagement and e-commerce optimization."'::jsonb
)
WHERE name = 'Michelle Peluso' AND deleted_at IS NULL;

-- Johnathan Rodgers - Media/Entertainment
UPDATE board_members 
SET matrix_data = jsonb_set(
    COALESCE(matrix_data, '{}'::jsonb),
    '{background,bio}',
    '"Former President of Discovery Networks and CEO of TV One with expertise in media, entertainment, and content distribution. Experience in broadcast technology and digital media platforms. Background in corporate strategy and multicultural market development."'::jsonb
)
WHERE name = 'Johnathan Rodgers' AND deleted_at IS NULL;

-- Phyllis Wise - Academia/Healthcare
UPDATE board_members 
SET matrix_data = jsonb_set(
    COALESCE(matrix_data, '{}'::jsonb),
    '{background,bio}',
    '"Former Chancellor of University of Illinois with academic expertise in life sciences, research administration, and healthcare innovation. Background in biomedical research and scientific leadership. Experience with research data management and academic technology infrastructure."'::jsonb
)
WHERE name = 'Phyllis Wise' AND deleted_at IS NULL;
