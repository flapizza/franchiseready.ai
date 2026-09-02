import {expect,test,type Page} from "@playwright/test";
async function enter(page:Page){await page.goto("/login");await page.getByRole("button",{name:/Enter Conference Demo as/i}).click();expect((await page.request.post("/crm/test-reset")).ok()).toBeTruthy();await page.goto("/crm/contacts");}
test("import, organize, filter, and promote one permanent Contact",async({page})=>{
  await enter(page);await page.getByRole("link",{name:"Lists & Tags"}).click();
  await page.getByLabel("New list name").fill("Legacy Newsletter");await page.getByRole("button",{name:"Create List"}).click();
  await page.getByLabel("New tag name").fill("Mailchimp Import");await page.getByRole("button",{name:"Create Tag"}).click();
  await page.getByRole("link",{name:"Back to Contacts"}).click();await page.getByRole("link",{name:"Import Contacts"}).click();
  await page.getByLabel("CSV file").setInputFiles({name:"legacy.csv",mimeType:"text/csv",buffer:Buffer.from("First Name,Last Name,Email,Company\nKatherine,Johnson,katherine@example.test,NASA")});
  await expect(page.getByRole("heading",{name:"Map fields"})).toBeVisible();await page.getByRole("button",{name:"Review import"}).click();
  await page.getByLabel("Mailchimp Import").check();await page.getByLabel("Add to list").selectOption({label:"Legacy Newsletter"});
  await page.getByRole("button",{name:"Import Contacts"}).click();await expect(page.getByRole("heading",{name:"Import results"})).toBeVisible();
  await expect(page.getByText("Created").locator("..")).toContainText("1");await page.getByRole("link",{name:"View Contacts"}).click();
  await expect(page.getByRole("link",{name:"Katherine Johnson"}).first()).toBeVisible();await page.getByLabel("Filter by tag").selectOption({label:"Mailchimp Import"});await page.getByRole("button",{name:"Apply filters"}).click();
  await page.getByRole("link",{name:"Katherine Johnson"}).first().click();await expect(page.getByRole("heading",{name:"Katherine Johnson"})).toBeVisible();await expect(page.getByText("unknown",{exact:true}).first()).toBeVisible();
  await page.getByRole("button",{name:"Promote to Candidate"}).click();await expect(page.getByRole("link",{name:"Open Candidate 360"})).toBeVisible();
});
test("current-page bulk action is explicit and responsive",async({page})=>{await page.setViewportSize({width:390,height:844});await enter(page);await page.getByRole("link",{name:"Lists & Tags"}).click();await page.getByLabel("New tag name").fill("Current Page");await page.getByRole("button",{name:"Create Tag"}).click();await page.goto("/crm/contacts");await page.getByText("Select current page").click();await page.getByLabel("Bulk tag").selectOption({label:"Current Page"});await expect(page.getByText(/selected/)).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth)).toBeFalsy();});
