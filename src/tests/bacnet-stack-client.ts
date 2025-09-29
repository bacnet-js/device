
import { ObjectType, PropertyIdentifier } from '@bacnet-js/client';

const bsExec = async (bin: string, args: string[]) => {
  const res = await fetch('http://bacnet-stack-server:3000', {
    method: 'POST',
    body: `${bin} ${args.map(a => `"${a}"`).join(' ')}`,
  });
  if (res.ok) {
    const stdout = await res.text();
    return stdout;
  }
  const err = await res.text();
  throw new Error(err);
};

export const bsReadProperty = async (devIn: number, objType: ObjectType, objIn: number, propId: PropertyIdentifier) => {
  return await bsExec('bacrp', [`${devIn}`, `${objType}`, `${objIn}`, `${propId}`]);
};
