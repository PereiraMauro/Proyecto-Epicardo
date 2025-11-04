export async function providerMock() {
  // números de prueba
  const oficial = 970 + Math.floor(Math.random() * 10);
  const blue = 1180 + Math.floor(Math.random() * 10);
  return {
    base: "USD",
    ars: { oficial, blue },
    source: "MockProvider"
  };
}

export const providers = [providerMock];
