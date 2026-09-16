import {test,expect} from '@playwright/test';
test('Brand Presentation Studio: entry, five slides, local edits, preview and editable download',async({page},info)=>{
  const errors:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/*',route=>{const host=new URL(route.request().url()).hostname;return ['127.0.0.1','localhost'].includes(host)?route.continue():route.abort();});
  await page.goto('/login');await page.getByRole('button',{name:/Enter Conference Demo as/i}).click();await expect(page).toHaveURL(/\/crm$/);
  await page.goto('/crm/brands/actioncoach');await page.getByRole('link',{name:'Create Presentation',exact:true}).click();
  await expect(page.getByRole('main',{name:'Brand Presentation Studio'})).toBeVisible();
  await expect(page.locator('[data-studio-ready]'),JSON.stringify(errors)).toHaveAttribute('data-studio-ready','true',{timeout:30000});
  await page.getByLabel('Cover title',{exact:true}).fill('Explore ActionCOACH');
  await expect(page.locator('[data-slide-preview]')).toContainText('Explore ActionCOACH');
  await page.getByLabel('Include fees',{exact:true}).uncheck();
  for(const [slot,asset] of [['Brand logo','DEMO LOGO'],['Hero image','DEMO HERO'],['Business model image','DEMO IMAGE TWO'],['Additional brand image','DEMO IMAGE THREE']]){
    await page.getByRole('button',{name:'Choose '+slot,exact:true}).click();
    await page.getByRole('dialog',{name:'Demo presentation imagery'}).getByRole('button',{name:new RegExp('^'+asset+' .*synthetic, not actual brand imagery$')}).click();
  }
  await expect(page.locator('[data-slide-preview] img')).toHaveCount(2);
  for(let i=0;i<5;i++){
    await expect(page.getByText(`Slide ${i+1} of 5`,{exact:true})).toBeVisible();
    expect(await page.locator('[data-slide-preview]').evaluate(el=>{const r=el.getBoundingClientRect();return Math.abs(r.width/r.height-16/9)<.02})).toBe(true);
    expect(await page.locator('[data-slide-text]').evaluateAll(nodes=>nodes.filter(n=>n.scrollHeight>n.clientHeight+3||n.scrollWidth>n.clientWidth+3).map(n=>n.textContent))).toEqual([]);
    await page.locator('[data-slide-preview]').screenshot({path:info.outputPath(`slide-${i+1}.png`)});
    if(i<4)await page.getByRole('button',{name:'Next',exact:true}).click();
  }
  await expect(page.locator('[data-slide-preview]')).toContainText('not an offer to sell a franchise');
  await page.getByRole('button',{name:'Previous',exact:true}).click();
  const downloading=page.waitForEvent('download');await page.getByRole('button',{name:'Download PowerPoint',exact:true}).click();const download=await downloading;
  expect(await download.failure()).toBeNull();expect(download.suggestedFilename()).toMatch(/\.pptx$/);await download.saveAs(info.outputPath('studio.pptx'));
  expect(errors).toEqual([]);
});
