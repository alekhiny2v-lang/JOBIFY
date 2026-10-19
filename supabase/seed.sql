-- Optional realistic demonstration listings. Every company and vacancy is explicitly marked as demo.
insert into public.companies(name,description,is_demo)
values
 ('Northstar Studio','Demonstration company for design and technology careers.',true),
 ('Pixel & Form','Demonstration company for design and technology careers.',true),
 ('Harbor Labs','Demonstration company for design and technology careers.',true),
 ('Fieldnote Digital','Demonstration company for marketing and technology careers.',true),
 ('Monument Works','Demonstration company for creative careers.',true),
 ('Common Thread','Demonstration company for marketing and creative careers.',true),
 ('Juniper Systems','Demonstration company for data and technology careers.',true),
 ('Brightside Support','Demonstration company for customer support careers.',true)
on conflict(name) do nothing;

with listing(company,title,description,category,location,employment_type,work_arrangement,experience_level,skills,salary_min,salary_max) as (values
 ('Northstar Studio','Frontend Developer Intern','Join a collaborative product team building thoughtful, accessible web experiences. Work with experienced teammates, learn our development workflow, and contribute to a real product used by customers.','Development & Tech','Remote','Internship','Remote','Student / Intern',array['React','TypeScript','CSS','Git'],35000::numeric,50000::numeric),
 ('Pixel & Form','Junior Web Developer','We are looking for a curious early-career developer to help ship polished web features. Pair with engineers, improve existing interfaces, and learn how a production application is built and maintained.','Development & Tech','Karachi, Pakistan','Entry-level','Hybrid','Entry-level',array['JavaScript','HTML','CSS','REST APIs'],null,null),
 ('Harbor Labs','UI/UX Design Intern','Help make complex product workflows feel clear and effortless. Explore user needs, create wireframes and prototypes, and collaborate with design and engineering partners.','Design & Creative','Remote','Internship','Remote','Student / Intern',array['Figma','Prototyping','User research','Design systems'],null,null),
 ('Fieldnote Digital','Software Engineering Intern','Work alongside our engineering team on dependable software, from feature planning to implementation and testing. This internship is designed for hands-on learning and meaningful project ownership.','Development & Tech','Lahore, Pakistan','Internship','On-site','Student / Intern',array['Python','Git','Testing','Problem solving'],null,null),
 ('Common Thread','Digital Marketing Intern','Help our small marketing team plan useful content, understand campaign performance, and reach new audiences across digital channels.','Marketing & Growth','Hybrid · Karachi','Internship','Hybrid','Student / Intern',array['Content strategy','Analytics','SEO','Writing'],null,null),
 ('Monument Works','Graphic Designer','Create clean, consistent visual assets for digital products and brand communications, working closely with a small creative team.','Design & Creative','Remote','Entry-level','Remote','Entry-level',array['Adobe Illustrator','Typography','Layout','Figma'],null,null),
 ('Juniper Systems','Data Analyst Intern','Support data-informed decisions by cleaning datasets, exploring patterns, and communicating findings with clear visualizations.','Data & Analytics','Islamabad, Pakistan','Internship','On-site','Student / Intern',array['SQL','Spreadsheets','Data visualization','Python'],null,null),
 ('Brightside Support','Customer Support Associate','Help customers get the most from our product through thoughtful, clear support across email and chat.','Customer Support','Karachi, Pakistan','Full-time','Hybrid','Entry-level',array['Communication','Problem solving','Writing','Customer care'],null,null)
)
insert into public.jobs(company_id,created_by,title,description,category,location,employment_type,work_arrangement,experience_level,skills,salary_min,salary_max,salary_currency,status,is_demo)
select c.id,null,l.title,l.description,l.category,l.location,l.employment_type,l.work_arrangement,l.experience_level,l.skills,l.salary_min,l.salary_max,'PKR','active',true
from listing l join public.companies c on c.name=l.company
where not exists(select 1 from public.jobs j where j.company_id=c.id and j.title=l.title);
