export function setClearEnv () {
    delete process.env.PORT;
    delete process.env.HOST;
    delete process.env.ROOT_DIR;
}
