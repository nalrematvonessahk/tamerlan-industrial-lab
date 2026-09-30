const { chromium }=require('C:/Users/Tamerlan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');
(async()=>{
  const browser=await chromium.launch({headless:true,args:['--enable-webgl','--ignore-gpu-blocklist']});
  const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  fs.mkdirSync('qa-output',{recursive:true});
  await page.goto('http://127.0.0.1:4173/#plant');await page.waitForSelector('#loading',{state:'hidden'});await page.waitForTimeout(2000);
  await page.screenshot({path:'qa-output/plant.png'});
  await page.getByRole('button',{name:/Сепаратор S-101/}).click();await page.waitForTimeout(1600);await page.screenshot({path:'qa-output/separator.png'});
  if(!(await page.locator('#back').isVisible()))throw new Error('Drill-down did not expose back');
  await page.locator('#back').click();await page.waitForTimeout(1500);
  await page.getByRole('button',{name:/Резервуар T-201/}).click();await page.waitForTimeout(1500);await page.screenshot({path:'qa-output/tank.png'});
  await page.getByRole('button',{name:/Факельная установка/}).click();await page.waitForTimeout(1500);await page.screenshot({path:'qa-output/flare.png'});
  await page.locator('#flow-toggle').click();if(await page.locator('#flow-toggle').getAttribute('aria-checked')!=='false')throw new Error('Flow switch');
  await page.locator('[data-route=pump]').click();await page.waitForSelector('#explode');await page.waitForTimeout(1800);await page.screenshot({path:'qa-output/pump.png'});
  await page.locator('#explode-button').click();await page.waitForTimeout(1800);await page.screenshot({path:'qa-output/exploded.png'});
  if(await page.locator('#explode').inputValue()!=='100')throw new Error('Exploded slider');
  await page.locator('#section-toggle').click();await page.locator('[data-color=orange]').click();await page.locator('[data-part=impeller]').click();await page.screenshot({path:'qa-output/section.png'});
  await page.locator('#explode').fill('40');await page.locator('#explode').dispatchEvent('input');
  await page.locator('#about-open').click();if(!(await page.locator('#about').isVisible()))throw new Error('About dialog');await page.keyboard.press('Escape');
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:'qa-output/mobile-pump.png',fullPage:true});
  await page.locator('[data-route=plant]').click();await page.waitForTimeout(1500);await page.screenshot({path:'qa-output/mobile-plant.png',fullPage:true});
  const horizontalOverflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);if(horizontalOverflow)throw new Error('Mobile horizontal overflow');
  for(let i=0;i<3;i++){await page.locator('[data-route=pump]').click();await page.waitForSelector('#explode');await page.locator('[data-route=plant]').click();await page.waitForSelector('[data-asset=separator]');}
  console.log(JSON.stringify({errors,plant:await page.locator('#scene-title').innerText(),horizontalOverflow},null,2));
  await browser.close();if(errors.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1);});
