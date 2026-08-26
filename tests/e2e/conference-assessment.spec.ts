import { expect, test, type Page } from "@playwright/test";

const runtimeErrors = new WeakMap<Page,string[]>();
test.beforeEach(async({page})=>{const errors:string[]=[];runtimeErrors.set(page,errors);page.on("pageerror",error=>errors.push(`page: ${error.message}`));page.on("console",message=>{if(message.type()==="error")errors.push(`console: ${message.text()}`);});});
test.afterEach(async({page})=>expect(runtimeErrors.get(page)??[]).toEqual([]));

async function fillIntake(page: Page, firstName="Alex", email="alex.morgan@example.com") {
  await page.getByLabel("First name").fill(firstName); await page.getByLabel("Preferred name (optional)").fill(firstName === "Alex" ? "Lex" : firstName); await page.getByLabel("Last name").fill("Morgan"); await page.getByLabel("Email",{exact:true}).fill(email); await page.getByLabel("Mobile phone").fill("407-555-0132"); await page.getByLabel("Street address").fill("100 Conference Way"); await page.getByLabel("Address line 2 (optional)").fill("Suite 4"); await page.getByLabel("City").fill("Orlando"); await page.getByLabel("State/Province").fill("FL"); await page.getByLabel("ZIP/Postal code").fill("32801"); await page.getByLabel("Current occupation/title").fill("Operations Executive"); await page.getByLabel("Current employer (optional)").fill("Acme"); await page.getByLabel("LinkedIn profile (optional)").fill("https://linkedin.com/in/alex-morgan"); await page.getByLabel("Have you owned a business before?").selectOption("yes"); await page.getByLabel(/Briefly describe/).fill("Previously operated a local services company."); await page.getByLabel("Have you previously explored franchise ownership?").selectOption("yes"); await page.getByLabel("Preferred contact method").selectOption("text"); await page.getByLabel("Best general contact time").selectOption("afternoon");
}
async function answerVisibleQuestions(page: Page) { const groups=page.locator("fieldset");for(let i=0;i<await groups.count();i++){const group=groups.nth(i);if(!(await group.locator("input:checked").count()))await group.locator("input").first().check();} }
async function completeCandidate(page:Page,firstName="Alex",email="alex.morgan@example.com"){await page.goto("/assessment/start");await fillIntake(page,firstName,email);await page.getByRole("button",{name:"Continue"}).click();await page.getByLabel("I understand and wish to continue.").check();await page.getByRole("button",{name:"Begin assessment"}).click();for(let section=1;section<=6;section++){await answerVisibleQuestions(page);await page.getByRole("button",{name:"Continue"}).click();}await page.getByLabel("I don't have a major concern right now").check();await page.getByRole("button",{name:"Build my profile"}).click();await expect(page.getByRole("heading",{name:"Your Franchise Ownership Profile"})).toBeVisible({timeout:15_000});await expect(page).toHaveURL(/\/assessment\/start\/results\/conf_/);await page.waitForFunction(()=>sessionStorage.getItem("frangroove.conference-assessment.v1")===null);return page.url();}

test("intake, consent, exclusive choices, conditional follow-up, back and refresh resume", async ({page})=>{
  await page.goto("/assessment/start"); await expect(page.getByRole("heading",{name:"Tell us a little about yourself"})).toBeVisible(); await page.getByRole("button",{name:"Continue"}).click(); await expect(page.getByLabel("First name")).toBeFocused(); await fillIntake(page); await page.getByRole("button",{name:"Continue"}).click(); await expect(page.getByRole("heading",{name:"Discover Your Franchise Ownership Profile"})).toBeVisible(); await expect(page.getByRole("button",{name:"Begin assessment"})).toBeDisabled(); await page.getByLabel("I understand and wish to continue.").check(); await page.getByRole("button",{name:"Begin assessment"}).click();
  await page.getByLabel("Build long-term wealth").check(); await page.getByLabel("Replace or exceed my current income").check(); await expect(page.getByRole("heading",{name:"Of the motivations you selected, which one matters most?"})).toBeVisible(); await page.getByLabel("I'm still figuring that out").check(); await expect(page.getByRole("checkbox",{name:/Build long-term wealth/})).not.toBeChecked(); await page.getByRole("checkbox",{name:/Build long-term wealth/}).check(); await expect(page.getByLabel("I'm still figuring that out")).not.toBeChecked(); await answerVisibleQuestions(page); await page.reload(); await expect(page.getByText("Step 1 of 6")).toBeVisible(); await expect(page.getByRole("checkbox",{name:/Build long-term wealth/})).toBeChecked(); await page.getByRole("button",{name:"Continue"}).click(); await expect(page.getByText("Step 2 of 6")).toBeVisible(); await page.getByRole("button",{name:"Back"}).click(); await expect(page.getByText("Step 1 of 6")).toBeVisible();
});

test("complete assessment creates deterministic candidate intelligence and cleanup preserves canonical demo", async ({page})=>{
  await page.goto("/assessment/start"); await fillIntake(page); await page.getByRole("button",{name:"Continue"}).click(); await page.getByLabel("I understand and wish to continue.").check(); await page.getByRole("button",{name:"Begin assessment"}).click();
  for(let section=1;section<=6;section++){await answerVisibleQuestions(page);await page.getByRole("button",{name:"Continue"}).click();}
  await expect(page.getByRole("heading",{name:/concerns you most/i})).toBeVisible(); await page.getByLabel("Losing financial security").check(); await page.getByLabel("Replacing my income").check(); await page.locator('fieldset').last().getByLabel("Losing financial security").check(); await page.getByRole("button",{name:"Build my profile"}).click(); await expect(page.getByText("Building your Franchise Ownership Profile")).toBeVisible(); await expect(page.getByRole("heading",{name:"Your Franchise Ownership Profile"})).toBeVisible({timeout:15_000}); await expect(page.getByText("Questions Worth Discussing With Your Consultant")).toBeVisible(); await expect(page.getByText(/not independently verified/i)).toBeVisible();
  await page.goto("/login"); await page.getByRole("button",{name:/Enter Conference Demo as/i}).click(); await expect(page).toHaveURL(/\/crm$/); await expect(page.getByText("New Candidate Intelligence Available")).toBeVisible(); await page.setViewportSize({width:1366,height:768}); await page.getByRole("link",{name:"Open Candidate Intelligence"}).click(); await expect(page.getByRole("heading",{name:"Lex Morgan"})).toBeVisible(); const consultantBrief=page.getByRole("heading",{name:"Consultant Brief"});const startDiscovery=page.getByText("Start Discovery Here",{exact:true});await expect(consultantBrief).toBeVisible();await expect(startDiscovery).toBeVisible();expect((await consultantBrief.boundingBox())?.y??9999).toBeLessThan(768);expect((await startDiscovery.boundingBox())?.y??9999).toBeLessThan(768);await expect(page.getByRole("heading",{name:"Discovery Priorities"})).toBeVisible(); await expect(page.getByRole("heading",{name:"Franchise Model Implications"})).toBeVisible(); await expect(page.getByText(/Capability evidence:/)).toBeVisible();await expect(page.getByText(/Key Priority|· Priority/).first()).toBeVisible();await expect(page.locator("body")).not.toContainText(/· (high|normal)|Evidence: q\d|&#x20;/);const supporting=page.getByText("Supporting Evidence",{exact:true});await supporting.click();await expect(page.getByText("ownership motivation",{exact:true}).first()).toBeVisible(); await expect(page.getByText(/Gmail activity.*have not been created/)).toBeVisible();
  page.on("dialog",dialog=>dialog.accept()); await page.getByRole("button",{name:"Clear Conference Assessments"}).click(); await expect(page).toHaveURL(/\/crm$/); await expect(page.getByText("New Candidate Intelligence Available")).toHaveCount(0); await expect(page.getByText("Jared",{exact:false}).first()).toBeVisible(); await expect(page.getByText("Sarah",{exact:false}).first()).toBeVisible();
});

test("candidate assessment scrolls without horizontal overflow at IFPG device sizes",async({page})=>{for(const viewport of [{width:1920,height:1080},{width:1600,height:900},{width:1366,height:768},{width:1280,height:800},{width:390,height:844},{width:430,height:932},{width:768,height:1024}]){await page.setViewportSize(viewport);await page.goto("/assessment/start");const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,scrollable:document.documentElement.scrollHeight>document.documentElement.clientHeight}));expect(layout.overflow,`${viewport.width}x${viewport.height}`).toBeFalsy();if(layout.scrollable){await page.mouse.wheel(0,10000);await expect.poll(()=>page.evaluate(()=>window.scrollY),{message:`scroll down at ${viewport.width}x${viewport.height}`}).toBeGreaterThan(0);await page.mouse.wheel(0,-10000);await expect.poll(()=>page.evaluate(()=>window.scrollY),{message:`scroll up at ${viewport.width}x${viewport.height}`}).toBe(0);}}});

test("candidate assessment supports native touch swiping",async({page,context,browserName})=>{
  test.skip(browserName!=="chromium","Chromium CDP supplies real emulated touch input");
  await page.setViewportSize({width:390,height:844});
  await page.goto("/assessment/start");
  const client=await context.newCDPSession(page);
  await client.send("Emulation.setTouchEmulationEnabled",{enabled:true,maxTouchPoints:1});
  await client.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x:195,y:700}]});
  await client.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x:195,y:200}]});
  await client.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
  await expect.poll(()=>page.evaluate(()=>window.scrollY)).toBeGreaterThan(0);
  await client.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x:195,y:200}]});
  await client.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x:195,y:700}]});
  await client.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
  await expect.poll(()=>page.evaluate(()=>window.scrollY)).toBe(0);
});

test("legacy completed analysis is upgraded for candidate and consultant results",async({page})=>{
  await page.goto("/login");
  await page.getByRole("button",{name:/Enter Conference Demo as/i}).click();
  await expect(page).toHaveURL(/\/crm$/);
  const urls=await page.evaluate(async()=>{const response=await fetch("/assessment/start/test-legacy-assessment",{method:"POST"});if(!response.ok)throw new Error(`Legacy fixture failed: ${response.status}`);return response.json();});
  await page.goto(urls.candidateResultUrl);
  await expect(page.getByRole("heading",{name:"Your Franchise Ownership Profile"})).toBeVisible();
  await expect(page.getByText(/Your responses combine|You appear to value|Your responses point to useful areas/)).toBeVisible();
  await page.goto(urls.consultantResultUrl);
  await expect(page.getByRole("heading",{name:"Legacy Candidate"})).toBeVisible();
  await expect(page.getByRole("heading",{name:"Consultant Brief"})).toBeVisible();
  await expect(page.getByText("Start Discovery Here",{exact:true})).toBeVisible();
  await expect(page.locator("body")).not.toContainText(/Cannot read properties|&#x20;/);
  page.on("dialog",dialog=>dialog.accept());
  await page.getByRole("button",{name:"Clear Conference Assessments"}).click();
  await expect(page).toHaveURL(/\/crm$/);
});

test("long assessment sections support real wheel scrolling down and back up",async({page})=>{
  await page.setViewportSize({width:1366,height:768});
  await page.goto("/assessment/start");
  await fillIntake(page);
  await page.getByRole("button",{name:"Continue"}).click();
  await page.getByLabel("I understand and wish to continue.").check();
  await page.getByRole("button",{name:"Begin assessment"}).click();
  await answerVisibleQuestions(page);
  await page.getByRole("button",{name:"Continue"}).click();

  const heading=page.getByRole("heading",{level:1,name:"How You Lead and Operate"});
  const continueButton=page.getByRole("button",{name:"Continue"});
  await expect(heading).toBeVisible();
  const initialY=await page.evaluate(()=>window.scrollY);
  await page.mouse.wheel(0,10000);
  await expect.poll(()=>page.evaluate(()=>window.scrollY)).toBeGreaterThan(initialY);
  await expect(continueButton).toBeVisible();
  const lowerY=await page.evaluate(()=>window.scrollY);
  await page.mouse.wheel(0,-10000);
  await expect.poll(()=>page.evaluate(()=>window.scrollY)).toBeLessThan(lowerY);
  await expect.poll(()=>page.evaluate(()=>window.scrollY)).toBe(0);
  await expect(heading).toBeVisible();

  await page.keyboard.press("End");
  await expect(continueButton).toBeVisible();
  await page.keyboard.press("Home");
  await expect(heading).toBeVisible();
  await answerVisibleQuestions(page);
  await continueButton.click();
  await expect(page.getByText("Step 3 of 6")).toBeVisible();
});

test("multiple attendees remain separately accessible and cleanup removes all",async({page})=>{const firstUrl=await completeCandidate(page,"Avery","avery@example.com");const secondUrl=await completeCandidate(page,"Blair","blair@example.com");expect(firstUrl).not.toBe(secondUrl);await page.goto("/login");await page.getByRole("button",{name:/Enter Conference Demo as/i}).click();await expect(page.getByRole("region",{name:"New candidate intelligence"}).getByRole("link",{name:"Open Candidate Intelligence"})).toHaveCount(2);const links=await page.getByRole("region",{name:"New candidate intelligence"}).getByRole("link",{name:"Open Candidate Intelligence"}).evaluateAll(nodes=>nodes.map(node=>node.getAttribute("href")));expect(new Set(links).size).toBe(2);await page.getByRole("region",{name:"New candidate intelligence"}).getByRole("link",{name:"Open Candidate Intelligence"}).first().click();page.on("dialog",dialog=>dialog.accept());await page.getByRole("button",{name:"Clear Conference Assessments"}).click();await expect(page).toHaveURL(/\/crm$/);await expect(page.getByRole("region",{name:"New candidate intelligence"})).toHaveCount(0);await expect(page.getByText("Jared",{exact:false}).first()).toBeVisible();await expect(page.getByText("Sarah",{exact:false}).first()).toBeVisible();});

test("candidate report downloads as a safe, candidate-only PDF",async({page})=>{
  const resultUrl=await completeCandidate(page,"Michelle","michelle.wood@example.com");await expect(page.getByRole("link",{name:"Download My Report (PDF)"})).toBeVisible();
  const response=await page.request.get(`${new URL(resultUrl).pathname}/report`);expect(response.ok()).toBeTruthy();expect(response.headers()["content-type"]).toContain("application/pdf");expect(response.headers()["content-disposition"]).toContain("Michelle-Morgan-FranGroove-Ownership-Profile.pdf");
  const content=(await response.body()).toString("latin1");expect(content).toContain("Franchise Ownership Profile");expect(content).toContain("not independently verified by FranGroove");expect(content).not.toContain("INTERNAL CONSULTANT USE");expect(content).not.toContain("Potential Tensions");
  for(const viewport of [{width:390,height:844},{width:430,height:932},{width:768,height:1024},{width:1366,height:768}]){await page.setViewportSize(viewport);const download=page.getByRole("link",{name:"Download My Report (PDF)"});await download.scrollIntoViewIfNeeded();await expect(download).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth),`${viewport.width}x${viewport.height} result overflow`).toBeFalsy();}
});

test("conference consultant report remains protected and separate from the candidate result",async({page})=>{
  await completeCandidate(page,"Taylor","taylor.report@example.com");await expect(page.getByRole("link",{name:/Consultant Report/})).toHaveCount(0);expect((await page.request.get("/assessment/start/results/conf_missing/report")).status()).toBe(404);
  await page.goto("/login");await page.getByRole("button",{name:/Enter Conference Demo as/i}).click();const intelligence=page.getByRole("region",{name:"New candidate intelligence"}).getByRole("link",{name:"Open Candidate Intelligence"}).first();await intelligence.click();const download=page.getByRole("link",{name:"Download Consultant Report (PDF)"});await expect(download).toBeVisible();const href=await download.getAttribute("href");const response=await page.request.get(href!);expect(response.ok()).toBeTruthy();expect(response.headers()["content-type"]).toContain("application/pdf");const content=(await response.body()).toString("latin1");expect(content).toContain("INTERNAL CONSULTANT USE");expect(content).toContain("DISCOVERY PRIORITIES");expect(content).toContain("OPPORTUNITY CHARACTERISTICS");
});
