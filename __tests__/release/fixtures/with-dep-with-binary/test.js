/**
 * @flow
 */

jest.setTimeout(200000);

import * as os from 'os';
import * as path from 'path';
import {readDirectory, cleanUp, run, initFixtureSync} from '../../utils';

export default function initTest(params: {releaseType: string}) {
  const fixture = initFixtureSync(__dirname);
  const description = `esy release ${params.releaseType}: ${fixture.description}`;

  const releaseTag =
    params.releaseType === 'bin' ? `bin-${os.platform()}` : params.releaseType;

  const test = async function() {
    await fixture.npm(['install'], {cwd: fixture.project});

    const releaseStdout = await fixture.esyRelease(params.releaseType);
    expect(releaseStdout).toMatchSnapshot('release stdout');

    const releaseDir = await readDirectory(path.join(fixture.project, '_release'), {
      filter,
    });
    expect(releaseDir).toMatchSnapshot('release');

    const installationStdout = await fixture.npmPackAndInstall(['_release', releaseTag]);
    expect(installationStdout).toMatchSnapshot('installation stdout');

    const installationDir = await readDirectory(fixture.npmPrefix, {filter});
    expect(installationDir).toMatchSnapshot('installation');

    const res = await run(path.join(fixture.npmPrefix, 'bin', 'say-hello.exe'));
    expect(res).toBe('HELLO');
  };

  return {cleanUp, description, test};
}

const filter = filename => {
  return filename !== '<root>/lib/node_modules/with-dep-with-binary/_esy';
};
