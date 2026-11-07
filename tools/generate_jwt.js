const payload = {
  uuid: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  internal: false,
  sub: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  email: "medicazo@itaca.pro",
  exp: 1999999999
};
const header = { alg: "HS256", typ: "JWT" };
const b64 = obj => Buffer.from(JSON.stringify(obj)).toString('base64url');
const token = `${b64(header)}.${b64(payload)}.mockSignature`;
console.log('Generated mock JWT:');
console.log(token);
