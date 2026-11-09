import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const page=readFileSync(new URL("../exhibitors/index.html",import.meta.url),"utf8");
const home=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const platform=readFileSync(new URL("../assets/platform.js",import.meta.url),"utf8");
const locale=readFileSync(new URL("../assets/exhibitors.js",import.meta.url),"utf8");
test("exhibitors scope reuses eight illustrated home category cards",()=>{
  assert.equal((page.match(/class="industry-card"/g)||[]).length,8);
  assert.equal((page.match(/data-industry="\d"/g)||[]).length,8);
  for(let i=1;i<=8;i++){const img="industry-"+String(i).padStart(2,"0")+".webp";assert.ok(page.includes("../assets/"+img));assert.ok(home.includes("assets/"+img));}
  assert.ok(page.includes('id="industryModal"'));assert.ok(page.includes("industry-grid.js"));
  assert.doesNotMatch(page,/class="scope-row"/);
});
test("WHY EXHIBIT contains three translated editorial reasons",()=>{
  assert.equal((page.match(/data-benefit="[012]"/g)||[]).length,3);
  assert.ok(page.includes("cleaner and lower-carbon technologies"));
  assert.ok(locale.includes("汇聚中印尼能源合作"));
  assert.ok(locale.includes("让共同目标转化"));
  assert.ok(locale.includes("以实践经验开启"));
});
test("directory removed but distinct floorplan CTA kept",()=>{
  assert.doesNotMatch(page,/data-exhibitor-directory/);
  assert.doesNotMatch(page,/data-cms-block="exhibitor-directory"/);
  assert.ok(page.includes('data-cms-block="exhibitor-directory-2"'));
  assert.doesNotMatch(platform,/FR-014\/FR-110: exhibitor directory/);
});
test("PDF downloads have accessible icons and safe hrefs",()=>{
  assert.ok(platform.includes("cms-download-icon-pdf"));
  assert.ok(platform.includes("aria-label="));
  assert.ok(platform.includes("safeDownload"));
});
