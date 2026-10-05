import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const browser=await chromium.launch({headless:true,channel:'chrome'});
const evidence=[];
const root=new URL('../qa-evidence/',import.meta.url);
fs.mkdirSync(root,{recursive:true});
fs.mkdirSync(new URL('assets/',root),{recursive:true});
const origin=process.env.QA_URL??'http://127.0.0.1:4175/';
const file=name=>new URL(name,root).pathname;
for(const width of [360,390,768,1440]){
 const context=await browser.newContext({viewport:{width,height:width===1440?1100:844},deviceScaleFactor:1});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);await page.evaluate(async()=>{for(const i of document.images)i.loading='eager';await Promise.all([...document.images].filter(i=>i.getAttribute('src')).map(i=>i.decode()));});
 await page.waitForFunction(()=>document.querySelector('[data-photo-sequence]')?.classList.contains('photo-enhanced'));
 const state=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,loadedPhotos:[...document.querySelectorAll('img')].filter(i=>i.getAttribute('src')).every(i=>i.complete&&i.naturalWidth>0),publications:document.querySelectorAll('.pub-row').length,projects:document.querySelectorAll('.project-lead,.project-row').length,firstProject:document.querySelector('.project-lead h3')?.textContent,photoRegions:document.querySelectorAll('.photo-composition').length,laterPhotoGallery:document.querySelectorAll('.person img').length,formalPortraitPresent:[...document.querySelectorAll('img')].some(i=>i.src.includes('yuwei-yan')),fonts:document.fonts.check('16px DM'),pinHeight:document.querySelector('.photo-pin').getBoundingClientRect().height,palette:getComputedStyle(document.documentElement).getPropertyValue('--ink').trim()}));
 assert.equal(state.overflow,false);assert.equal(state.loadedPhotos,true);assert.equal(state.publications,13);assert.equal(state.projects,4);assert.equal(state.firstProject,'AgentSociety');assert.equal(state.photoRegions,1);assert.equal(state.laterPhotoGallery,0);assert.equal(state.formalPortraitPresent,false);assert.equal(state.palette,'#183c36');assert.ok(await page.evaluate(()=>document.querySelector('#publications').compareDocumentPosition(document.querySelector('#projects'))&Node.DOCUMENT_POSITION_FOLLOWING));assert.deepEqual(await page.locator('header nav a').allTextContents(),['Research','Publications','Projects','The person ↗']);assert.equal(await page.locator('.pub-figure [data-figure]').count(),10);assert.equal(await page.locator('.pub-figure .work-image-pending').count(),3);assert.equal(await page.locator('#projects [data-figure]').count(),4);
 const imageFrames=await page.evaluate(()=>[...document.querySelectorAll('#projects .work-image,.pub-figure .work-image')].map(el=>{const frame=el.parentElement.getBoundingClientRect();const link=el.getBoundingClientRect();const img=el.querySelector('img').getBoundingClientRect();return{label:el.textContent.trim(),frameHeight:frame.height,linkHeight:link.height,imageBottom:img.bottom,linkBottom:link.bottom,frameBottom:frame.bottom};}));
 for(const frame of imageFrames){assert.ok(frame.linkHeight<=frame.frameHeight+1,JSON.stringify(frame));assert.ok(frame.imageBottom<=frame.linkBottom+1,JSON.stringify(frame));}
 assert.ok(await page.evaluate(()=>document.querySelector('.project-list').getBoundingClientRect().top>=document.querySelector('.project-lead-visual').getBoundingClientRect().bottom));
 const previews=page.locator('[data-figure]');if(await previews.count()){const first=previews.first();await first.click();await page.locator('.figure-dialog').waitFor({state:'visible'});await page.locator('.figure-full').evaluate(el=>el.decode());assert.ok(await page.locator('.figure-full').evaluate(el=>el.naturalWidth>0));if(width===1440)await page.screenshot({path:file('paper-figure-enlarged-review.png')});await page.keyboard.press('Escape');await page.locator('.figure-dialog').waitFor({state:'hidden'});}
 await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.waitForFunction(()=>document.querySelector('[data-photo-sequence]').dataset.photoState==='mountain');
 const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.equal(axe.violations.length,0,JSON.stringify(axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.failureSummary)}))));
 if(width===1440){await page.screenshot({path:file('homepage-concept-hero.png')});await page.screenshot({path:file('homepage-concept-desktop.png'),fullPage:true});await page.locator('.photo-composition').screenshot({path:file('assets/sequence-mountain.png')});}
 if(width===390)await page.screenshot({path:file('homepage-concept-mobile.png'),fullPage:true});
 const geometry=await page.evaluate(()=>{const el=document.querySelector('[data-photo-sequence]');return{top:el.getBoundingClientRect().top+scrollY,run:parseFloat(el.style.getPropertyValue('--photo-run')),trigger:parseFloat(el.style.getPropertyValue('--photo-trigger'))}});
 for(const [ratio,name] of [[.48,'cafe'],[.96,'stage']]){
  await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),geometry.top-geometry.trigger+geometry.run*ratio);
  await page.waitForFunction(name=>document.querySelector('[data-photo-sequence]').dataset.photoState===name,name);
  const opacity=await page.locator(name==='cafe'?'.photo-cafe-layer':'.photo-stage-layer').evaluate(el=>Number(getComputedStyle(el).opacity));assert.ok(opacity>.9);
  if(width===1440){await page.locator('.photo-composition').screenshot({path:file(`assets/sequence-${name}.png`)});await page.screenshot({path:file(`photo-${name}-desktop-review.png`)});}
  if(width===390)await page.screenshot({path:file(`photo-${name}-mobile-review.png`)});
 }
 await page.locator('[data-photo-motion]').click();const pausedPhase=await page.locator('[data-photo-sequence]').getAttribute('data-photo-phase');await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),geometry.top);await page.waitForTimeout(100);assert.equal(await page.locator('[data-photo-sequence]').getAttribute('data-photo-phase'),pausedPhase);
 await page.locator('[data-photo-select="1"]').click();assert.equal(await page.locator('[data-photo-sequence]').getAttribute('data-photo-state'),'cafe');assert.equal(await page.locator('[data-photo-motion]').getAttribute('aria-pressed'),'true');
 await page.locator('[data-photo-select="2"]').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('[data-photo-sequence]').getAttribute('data-photo-state'),'stage');
 assert.equal(errors.length,0);evidence.push({width,...state,errors,violations:[],sectionOrder:'Publications before Projects passed',navigationOrder:'passed',paperFigures:10,pendingPaperFigures:3,projectImages:4,imageFrames:'all paper/project images contained, no lead overlap',figureEnlargement:'passed',escapeClosesFigure:'passed',nativeScrollCafe:'passed',nativeScrollStage:'passed',pause:'passed',manualSelection:'passed',keyboardSelection:'passed'});
 await context.close();
}
const reducedContext=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const reduced=await reducedContext.newPage();await reduced.goto(origin,{waitUntil:'networkidle'});
assert.equal(await reduced.locator('.photo-pin').evaluate(el=>getComputedStyle(el).position),'static');assert.equal(await reduced.locator('[data-photo-motion]').isVisible(),false);
await reduced.keyboard.press('Tab');assert.equal(await reduced.evaluate(()=>document.activeElement.textContent),'Skip to research');await reduced.keyboard.press('Enter');assert.equal(await reduced.evaluate(()=>document.activeElement.id),'research');
await reduced.locator('[data-photo-select="2"]').click();assert.equal(await reduced.locator('[data-photo-sequence]').getAttribute('data-photo-state'),'stage');assert.equal(await reduced.locator('.photo-stage-layer').evaluate(el=>getComputedStyle(el).transform),'none');await reduced.screenshot({path:file('photo-reduced-motion-review.png')});
evidence.push({reducedMotion:'static manual composition passed',keyboardSkipLink:'passed',reducedMotionManualSelection:'passed'});await reducedContext.close();
const noJSContext=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const noJS=await noJSContext.newPage();await noJS.goto(origin);assert.equal(await noJS.locator('.pub-row').count(),13);assert.equal(await noJS.locator('.project-lead,.project-row').count(),4);assert.equal(await noJS.locator('.photo-controls').isVisible(),false);assert.equal(await noJS.locator('.photo-alpine img').evaluate(el=>el.naturalWidth>0),true);evidence.push({noJavaScript:'initial image and all scholarly content passed'});await noJSContext.close();
fs.writeFileSync(file('review-results.json'),JSON.stringify(evidence,null,2));console.log(JSON.stringify(evidence,null,2));await browser.close();
