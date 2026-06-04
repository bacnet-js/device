import { ApplicationTag, ObjectType, PropertyIdentifier } from '@bacnet-js/client';

export const bsExec = async (bin: string, args: string[]) => {
  const res = await fetch('http://bacnet-stack-runner:3000', {
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

export const bsReadProperty = async (devIn: number, objType: ObjectType, objIn: number, propId: PropertyIdentifier, index?: number) => {
  const args = [`${devIn}`, `${objType}`, `${objIn}`, `${propId}`];
  if (index !== undefined) {
    args.push(`${index}`);
  }
  return await bsExec('bacrp', args);
};

export const bsReadMultiple = async (devIn: number, tuples: [objType: ObjectType, objIn: number, propId: PropertyIdentifier, index?: number][]) => {
  // bacrpm 123 analog-input 77 85 analog-input 78 85
  const args = tuples.flatMap((tuple) => {
    const ser = [`${tuple[0]}`, `${tuple[1]}`];
    if (tuple[3] !== undefined) {
      ser.push(`${tuple[2]}[${tuple[3]}]`);
    } else {
      ser.push(`${tuple[2]}`);
    }
    return ser;
  });
  args.unshift(`${devIn}`);
  const res = await bsExec('bacrpm', args)
  return res.replaceAll(/\r?\n/g, ' ')
    .replaceAll(/\s+/g, ' ')
    .trim();
};

export const bsWriteProperty = async (
  devIn: number,
  objType: ObjectType,
  objIn: number,
  propId: PropertyIdentifier,
  priority: number,
  tag: ApplicationTag,
  value: string | number | null,
  index: number = -1,
) => {
  return await bsExec('bacwp', [
    `${devIn}`,
    `${objType}`,
    `${objIn}`,
    `${propId}`,
    `${priority}`,
    `${index}`,
    `${tag}`,
    `${value}`,
  ]);
};
