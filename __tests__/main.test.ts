jest.mock('@actions/exec')

import * as exec from '@actions/exec'
import {run, setEnvironmentVariables} from '../src/main'

describe('run tests', () => {
  beforeEach(() => {
    process.env.GITHUB_HEAD_REF = 'refs/heads/lorem/ipsum_foo+bar'
    process.env.INPUT_BUILD = 'true'
    process.env.INPUT_LINT = 'true'
    process.env.INPUT_TEST = 'true'
    process.env.INPUT_PUSH = 'true'
  })

  afterEach(() => {
    delete process.env.DOCKERIZED_FRIENDLY_GIT_BRANCH_NAME
    delete process.env.GITHUB_REF
    delete process.env.GITHUB_HEAD_REF
    delete process.env.INPUT_BUILD
    delete process.env.INPUT_LINT
    delete process.env.INPUT_TEST
    delete process.env.INPUT_PUSH
  })

  test('should set the docker friendly branch name as docker tag when branch is not master', async () => {
    setEnvironmentVariables()
    expect(process.env.DOCKERIZED_FRIENDLY_GIT_BRANCH_NAME).toEqual(
      'lorem_ipsum_foo+bar'
    )
  })

  test('should set the docker friendly branch name as docker tag when branch is not master', async () => {
    process.env.GITHUB_HEAD_REF = 'refs/heads/this'
    setEnvironmentVariables()
    expect(process.env.DOCKERIZED_FRIENDLY_GIT_BRANCH_NAME).toEqual('this')
  })

  test('should set the docker tag as latest when branch is master', async () => {
    process.env.GITHUB_REF = 'refs/heads/master'

    setEnvironmentVariables()
    expect(process.env.DOCKERIZED_FRIENDLY_GIT_BRANCH_NAME).toEqual('latest')
  })

  test('should throw exception when GITHUB_HEAD_REF is not prefixed by refs/heads/', async () => {
    process.env.GITHUB_HEAD_REF = 'foo'

    expect(setEnvironmentVariables).toThrowError(
      /unable to determine branch name/
    )
  })

  test('should throw exception when unable to determine docker tag from branch name', async () => {
    delete process.env.GITHUB_HEAD_REF

    expect(setEnvironmentVariables).toThrowError(
      /GITHUB_HEAD_REF environment variable not set/
    )
  })

  test('should build, lint, test, push when all options provided', async () => {
    await run()
    expect(exec.exec).toHaveBeenCalledTimes(4)
    expect(exec.exec).toHaveBeenNthCalledWith(1, 'make build')
    expect(exec.exec).toHaveBeenNthCalledWith(2, 'make lint')
    expect(exec.exec).toHaveBeenNthCalledWith(3, 'make test')
    expect(exec.exec).toHaveBeenNthCalledWith(4, 'make push')

    expect(process.env.DOCKERIZED_FRIENDLY_GIT_BRANCH_NAME).toEqual(
      'lorem_ipsum_foo+bar'
    )
  })

  test('should build and push when only build and push is true', async () => {
    delete process.env.INPUT_LINT
    delete process.env.INPUT_TEST

    await run()
    expect(exec.exec).toHaveBeenCalledTimes(2)
    expect(exec.exec).toHaveBeenNthCalledWith(1, 'make build')
    expect(exec.exec).toHaveBeenNthCalledWith(2, 'make push')
  })

  test('should build, lint and push when only build and push is true', async () => {
    delete process.env.INPUT_LINT

    await run()
    expect(exec.exec).toHaveBeenCalledTimes(3)
    expect(exec.exec).toHaveBeenNthCalledWith(1, 'make build')
    expect(exec.exec).toHaveBeenNthCalledWith(2, 'make test')
    expect(exec.exec).toHaveBeenNthCalledWith(3, 'make push')
  })

  test('should build, test and push when only build and push is true', async () => {
    delete process.env.INPUT_TEST

    await run()
    expect(exec.exec).toHaveBeenCalledTimes(3)
    expect(exec.exec).toHaveBeenNthCalledWith(1, 'make build')
    expect(exec.exec).toHaveBeenNthCalledWith(2, 'make lint')
    expect(exec.exec).toHaveBeenNthCalledWith(3, 'make push')
  })

  test('should build when only buildis true', async () => {
    delete process.env.INPUT_LINT
    delete process.env.INPUT_TEST
    delete process.env.INPUT_PUSH

    await run()
    expect(exec.exec).toHaveBeenCalledTimes(1)
    expect(exec.exec).toHaveBeenNthCalledWith(1, 'make build')
  })
})
