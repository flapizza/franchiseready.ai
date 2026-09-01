import { expect, test, type Page } from "@playwright/test";

async function enterAndReset(page: Page) {
  await page.goto("/login"); await page.getByRole("button", { name: /Enter Conference Demo as/i }).click();
  await expect(page).toHaveURL(/\/crm$/); expect((await page.request.post("/crm/test-reset")).ok()).toBeTruthy();
  await page.getByRole("navigation").getByRole("link", { name: "Contacts" }).click();
}

async function createGrace(page: Page) {
  await page.getByRole("link", { name: "Add Contact" }).first().click();
  const add=page.getByRole("form",{name:"Add contact"});
  await add.getByLabel("First name").fill("Grace");await add.getByLabel("Last name").fill("Hopper");
  await add.getByLabel("Primary email").fill(" Grace.Hopper@Example.Test ");await add.getByLabel("Primary phone").fill("+1 (555) 010-4242");
  await add.getByLabel("City").fill("Arlington");await add.getByLabel("State / province").fill("VA");await add.getByLabel("Postal code").fill("22201");
  await add.getByLabel("Source").fill("Professional Referral");await add.getByLabel("Company").fill("Compilers Inc.");
  await add.getByRole("button",{name:"Add Contact"}).click();await expect(page.getByRole("heading",{name:"Contact created"})).toBeVisible();
  await page.getByRole("link",{name:"Open Contact Detail"}).click();
  await expect(page).toHaveURL(/\/crm\/contacts\/contact-demo-/);return page.url();
}

test("Contacts to candidate workflow remains complete through the composed workspace",async({page})=>{
  const errors:string[]=[];page.on("console",message=>{if(message.type()==="error")errors.push(message.text())});page.on("pageerror",error=>errors.push(error.message));
  await page.setViewportSize({width:1440,height:900});await enterAndReset(page);
  await expect(page.locator("main").getByRole("heading",{name:"Contacts",exact:true})).toBeVisible();const detailUrl=await createGrace(page);
  await expect(page.getByRole("heading",{name:"Grace Hopper"})).toBeVisible();await page.getByRole("link",{name:"Edit Contact"}).click();
  const edit=page.getByRole("form",{name:"Edit contact"});await edit.getByLabel("Preferred name").fill("Amazing Grace");await edit.getByLabel("Title / occupation").fill("Computer Scientist");await edit.getByRole("button",{name:"Save Changes"}).click();await expect(edit.getByRole("status")).toContainText("Contact updated");
  await page.goto(detailUrl);await expect(page.getByRole("heading",{name:"Amazing Grace Hopper"})).toBeVisible();
  await page.getByRole("link",{name:"Add Contact"}).first().click();const duplicate=page.getByRole("form",{name:"Add contact"});await duplicate.getByLabel("First name").fill("Another");await duplicate.getByLabel("Last name").fill("Person");await duplicate.getByLabel("Primary email").fill("grace.hopper@example.test");await duplicate.getByRole("button",{name:"Add Contact"}).click();await expect(duplicate.getByRole("alert")).toContainText("already exists");
  await page.goto(detailUrl);await page.getByRole("button",{name:"Promote to Candidate"}).click();const candidate=page.getByRole("link",{name:"Open Candidate 360"});await expect(candidate).toBeVisible();await candidate.click();await expect(page.getByRole("heading",{name:"Grace Hopper"})).toBeVisible();
  await page.goto(detailUrl);await expect(page.getByRole("link",{name:"Open Candidate 360"})).toBeVisible();await expect(page.getByRole("button",{name:"Promote to Candidate"})).toHaveCount(0);expect(errors).toEqual([]);
});

test("Contacts list and forms remain usable at desktop compact and mobile widths",async({page})=>{
  await enterAndReset(page);
  for(const viewport of [{width:1440,height:900},{width:1280,height:800},{width:390,height:844}]){await page.setViewportSize(viewport);await page.goto("/crm/contacts");expect(await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth),`${viewport.width}x${viewport.height}`).toBeFalsy();await expect(page.getByRole("search")).toBeVisible();await page.goto("/crm/contacts/new");await expect(page.getByRole("form",{name:"Add contact"})).toBeVisible();await expect(page.getByRole("button",{name:"Add Contact"})).toBeVisible();}
});

test("canonical reset clears temporary Contacts state without changing the IFPG story",async({page})=>{
  await enterAndReset(page);await createGrace(page);expect((await page.request.post("/crm/test-reset")).ok()).toBeTruthy();await page.goto("/crm/contacts");await expect(page.getByText("Grace Hopper",{exact:true})).toHaveCount(0);await page.goto("/crm");await expect(page.getByText("IFPG Candidate Story").locator("xpath=ancestor::section").getByRole("heading",{name:"John Smith"})).toBeVisible();
});
