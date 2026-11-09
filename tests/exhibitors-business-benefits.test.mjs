import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const root=new URL("../",import.meta.url);
const get=path=>readFileSync(new URL(path,root),"utf8");
const html=get("exhibitors/index.html"),css=get("assets/exhibitor-benefits.css"),js=get("assets/exhibitor-benefits.js");
const platform=get("assets/platform.js");
test("five distinct business benefits are present",()=>{
 const cards=html.match(/class="imdx-benefit-card(?: imdx-benefit-featured)?"/g)||[];
 assert.equal(cards.length,5);
 for(let i=0;i<5;i++){assert.ok(html.includes('data-exhibitor-i18n="title'+i+'"'));assert.ok(html.includes('data-exhibitor-i18n="body'+i+'"'));}
 assert.match(html,/id="business-benefits"/);
});
test("site identity and all existing customer flows remain",()=>{
 assert.equal((html.match(/class="why-num"/g)||[]).length,3);
 assert.equal((html.match(/class="industry-card"/g)||[]).length,8);
 assert.match(html,/data-cms-block="exhibitor-downloads"/);
 assert.match(html,/data-cms-block="exhibitor-directory-2"/);
 assert.match(html,/data-action="exhibitor"/);
 assert.doesNotMatch(html,/data-exhibitor-directory/);
});
test("benefit cards are accessible and responsive",()=>{
 assert.match(html,/aria-label="Five reasons to exhibit at IMDX 2027"/);
 assert.match(css,/@media \(max-width:700px\)/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(html,/exhibitor-benefits.css/);
 assert.match(html,/exhibitor-benefits.js/);
 assert.match(js,/IMDX_translateExhibitorBenefits/);
 assert.match(platform,/IMDX_translateExhibitorBenefits/);
});
test("English and Chinese translations exist",()=>{
 for(const field of ["eyebrow","head1","head2","intro","title0","title1","title2","title3","title4","body0","body1","body2","body3","body4"]){
  assert.match(js,new RegExp("^\\s*"+field+":\\[", "m"));
 }
 assert.match(js,/发掘高质量商机/);
 assert.match(js,/深化客户关系/);
});
test("new CMS keys are unique and old keys are preserved",()=>{
 const keys=[...html.matchAll(/data-cms-f="(make-your-next-connection\.\d+)"/g)].map(m=>m[1]);
 assert.equal(keys.length,32);
 assert.equal(new Set(keys).size,32);
 for(let n=0;n<32;n++)assert.ok(keys.includes("make-your-next-connection."+n));
});
