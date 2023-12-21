describe("Test Configuration", () => {
  test("If it returns null", () => {
    console.log(process.env.NODE_ENV);
    console.log(process.env.TEST_DB);
    const n = null;
    expect(n).toBeNull();
    expect(n).toBeDefined();
    expect(n).not.toBeUndefined();
    expect(n).not.toBeTruthy();
    expect(n).toBeFalsy();
  });
});
