import { Selector } from 'testcafe'
import { ClientFunction } from 'testcafe'

fixture.skip('Dependency')
.page(`http://localhost:8002/test/fixture/dependency.html`)

const getCbor = ClientFunction(() => CBOR)
const getElliptic = ClientFunction(() => elliptic)
const getProtobuf = ClientFunction(() => protobuf)
const getJss = ClientFunction(() => jss)
const getJssNested = ClientFunction(() => jssNested)

test('elliptic', async t => {
  const elliptic = await getElliptic()
  await t.expect(elliptic === undefined).eql(false, 'elliptic not loaded')
})

test('cbor', async t => {
  const cbor = await getCbor()
  await t.expect(cbor === undefined).eql(false, 'cbor not loaded')
})

test('protobuf', async t => {
  const protobuf = await getProtobuf()
  await t.expect(protobuf === undefined).eql(false, 'protobuf not loaded')
})

test('jss', async t => {
  const jss = await getJss()
  await t.expect(jss === undefined).eql(false, 'jss not loaded')
})

test('jssNested', async t => {
  const jssNested = await getJssNested()
  await t.expect(jssNested === undefined).eql(false, 'jssNested not loaded')
})
