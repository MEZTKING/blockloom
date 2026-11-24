import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { ENGINE_VERSION, generate } from '../core/index.js';

const SEED = 20261124;
const CASES = [
  ['mossy cobblestone with tiny cyan crystals', 'side', 16, 'cc1a3ccb9c09b0e887e444cafb1e39aaf6af76c998f1a25e74bbfbc33b02fabb'],
  ['cracked deepslate with glowing amber veins', 'side', 16, '24d1e437201628259a469eb2ed7a524b2878e763a2f8f02777128464852589e1'],
  ['frosted oak planks', 'side', 32, '7f24030855e4994c8915b5b4ec2dfb41f983c7efcf14768a12779582652c7943'],
  ['ancient gilded stone', 'top', 16, '96d6db0fab4cf6d0643df0b8351f72fc66159f15177dd1091c69c4a71d026ac2'],
  ['red stained glass', 'side', 16, '46281ae5267e3395e063e99f57b384997a02b199e6987f92aee9d4fc7c8e2b73'],
  ['oxidized copper block', 'side', 16, '682490e1217a6b1c141af5c967a0ca894512a42a3928d52dd4bd886accf01c94'],
  ['cutout leaves', 'side', 16, '351a27846f8abdfffab6e3512c121cedac1fa75c6c42c919de2270845e0d7ef2'],
  ['iron block', 'top', 32, '1104f707968e76be5170893c526604ce95071bd1a57e227ab16189650a012311'],
  ['blue concrete', 'side', 16, 'c4aa1389d3e4bf3fa3110d026d3f22f1c4788b639c124ea9de2bbc4ff321cdec'],
  ['nether bricks', 'side', 16, 'bca4517c244ab89219aa8c5e530a3669fd04dcaae5d96a9542b44e5f4684d496'],
  ['rugged sand', 'side', 16, '3b1190da2ceb3861d6f0ab4737818ca6d908d9d28766c7918f717ca8cf692298'],
  ['smooth snow', 'side', 32, '9d38a623807840464a172737ed7c56f5bb313142f2d7bd73e9a6148b228cfc19'],
  ['ice', 'side', 16, '75b33aadf9f6863c3629aa9340e5a8d9fddf98837001637dd3c402e2bf2c9afe'],
  ['gold ore', 'side', 16, 'dc4dc3978dc4e3b1cfea0371b6f6fa6e071930b8c8011c862c66e6341f9dec9d'],
  ['diamond block', 'side', 16, '0347ad2f68fba5a14ea23ad1c1ad6ccf5b8e2d01df970bc34fe400ccdfb1ad70'],
  ['white wool', 'side', 16, '9f8733f9e95684799c83726c2994541a845778b80df81ed2016a86147ad89abd'],
  ['grass block', 'top', 16, 'fe9cc5691b33438b1e736b477431ae110e87b1e31aaae43ee46bfc115968179f'],
  ['oak log', 'side', 32, '327b097b7b401d2ebb7b919f0a505c6cdb2003921fc6df880b1887881c009c25'],
  ['terracotta', 'bottom', 16, '50e2b4010bc15d0c3cb473d3df78a1a35b9fe5bb2814bac9d927146396a2a0c1'],
  ['prismarine', 'side', 16, '6438f0a9be0c55acb6f60dea69e1981853b7b9043c6d440dd2249e47fcdaca07'],
];

test('golden texture hashes pin the engine output', () => {
  assert.equal(ENGINE_VERSION, '1.0.0');
  for (const [prompt, face, size, expected] of CASES) {
    const result = generate({ prompt, seed: SEED, size, face, finish: 'balanced' });
    const hash = createHash('sha256').update(result.rgba).digest('hex');
    assert.equal(hash, expected, `${prompt} (${face}, ${size}px) — update ENGINE_VERSION before changing this hash`);
    assert.equal(result.version, ENGINE_VERSION);
  }
});
