
import { ObjectType, PropertyIdentifier } from '@bacnet-js/client';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const pExec = promisify(exec);

const bsExec = async (bin: string, args: string[]) => {
  const { stdout, stderr } = await pExec(`docker run --rm --network host bacnet-stack ./${bin} ${args.map(a => `"${a}"`).join(' ')}`);
  return stdout;
};

export const bsReadProperty = async (devIn: number, objType: ObjectType, objIn: number, propId: PropertyIdentifier) => {
  return await bsExec('bacrp', ['--mac 127.0.0.1:47808', `${devIn}`, `${objType}`, `${objIn}`, `${propId}`]);
};
