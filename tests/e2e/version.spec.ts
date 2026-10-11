import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
const {version}=JSON.parse(readFileSync(new URL('../../package.json',import.meta.url),'utf8')) as {version:string};
test('visible frontend version matches the package and injected build value',async({page})=>{
 await page.goto('/');await expect(page.getByLabel('Game version')).toHaveText(`v${version}`);
 const injected=await page.evaluate(async()=>{const entry='/src/game/data/version.ts';return (await import(entry)).APP_VERSION;});expect(injected).toBe(version);
});
