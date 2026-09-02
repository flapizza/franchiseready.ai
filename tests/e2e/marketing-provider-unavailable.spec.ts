import{expect,test}from'@playwright/test';
const url=required('NEXT_PUBLIC_SUPABASE_URL'),key=required('SUPABASE_SERVICE_ROLE_KEY'),email=required('PACK2A_TEST_EMAIL'),password=required('PACK2A_TEST_PASSWORD');test.setTimeout(180_000);
test.beforeAll(async()=>{expect(process.env.PERSISTENCE_MODE).toBe('supabase');const response=await fetch(`${url}/auth/v1/admin/users`,{method:'POST',headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({email,password,email_confirm:true})});expect(response.status).toBe(200)});
test('production composition visibly refuses provider delivery and has no demo fallback',async({page})=>{
 await page.goto('/login');await page.getByLabel('Email address').fill(email);await page.getByLabel('Password').fill(password);await page.getByRole('button',{name:'Sign in'}).click();await expect(page).toHaveURL(/\/$/);await page.goto('/crm');await expect(page).toHaveURL(/\/onboarding$/);
 await page.getByLabel('Organization name').fill('Pack 5 Safe Unavailable');await page.getByLabel('Your display name').fill('Pack 5 Consultant');await page.getByRole('button',{name:'Create workspace'}).click();await expect(page).toHaveURL(/\/crm$/);
 await page.goto('/crm/segments/new');await page.getByLabel('Segment name').fill('Provider check');await page.getByRole('button',{name:'Save Segment'}).click();await expect(page).toHaveURL(/\/crm\/segments\/seg_/);await page.getByRole('link',{name:'Create Campaign from Segment'}).click();
 await page.getByLabel('Campaign name').fill('Unavailable provider');await page.getByLabel('Body content').fill('Provider configuration check');await page.getByRole('button',{name:'Save Draft'}).click();await expect(page).toHaveURL(/\/crm\/campaigns\/camp_/);
 const warning=page.getByText(/External marketing delivery provider is not configured/);await expect(warning).toBeVisible();await expect(warning).toContainText('no simulated fallback')
});
function required(name:string){const value=process.env[name];if(!value)throw new Error(`${name} is required`);return value}
