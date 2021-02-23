jest.mock('@actions/exec')

import * as exec from '@actions/exec'
import {run, setEnvironmentVariables} from '../src/main'

describe('run tests', () => {
  beforeEach(() => {
    delete process.env.GITHUB_REF

    process.env.GITHUB_HEAD_REF = 'lorem/ipsum_foo+bar'
    process.env.INPUT_BUILD = 'true'
    process.env.INPUT_LINT = 'true'
    process.env.INPUT_TEST = 'true'
    process.env.INPUT_PUSH = 'true'
    process.env.INPUT_MAKEDIR = '.'
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

  test('should set the docker tag as latest when branch is master', async () => {
    process.env.GITHUB_REF = 'refs/heads/master'

    setEnvironmentVariables()
    expect(process.env.DOCKERIZED_FRIENDLY_GIT_BRANCH_NAME).toEqual('latest')
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
    expect(exec.exec).toHaveBeenNthCalledWith(1, 'make -C . build')
    expect(exec.exec).toHaveBeenNthCalledWith(2, 'make -C . lint')
    expect(exec.exec).toHaveBeenNthCalledWith(3, 'make -C . test')
    expect(exec.exec).toHaveBeenNthCalledWith(4, 'make -C . push')

    expect(process.env.DOCKERIZED_FRIENDLY_GIT_BRANCH_NAME).toEqual(
      'lorem_ipsum_foo+bar'
    )
  })

  test('should build and push when only build and push is true', async () => {
    delete process.env.INPUT_LINT
    delete process.env.INPUT_TEST

    await run()
    expect(exec.exec).toHaveBeenCalledTimes(2)
    expect(exec.exec).toHaveBeenNthCalledWith(1, 'make -C . build')
    expect(exec.exec).toHaveBeenNthCalledWith(2, 'make -C . push')
  })

  test('should build, lint and push when only build and push is true', async () => {
    delete process.env.INPUT_LINT

    await run()
    expect(exec.exec).toHaveBeenCalledTimes(3)
    expect(exec.exec).toHaveBeenNthCalledWith(1, 'make -C . build')
    expect(exec.exec).toHaveBeenNthCalledWith(2, 'make -C . test')
    expect(exec.exec).toHaveBeenNthCalledWith(3, 'make -C . push')
  })

  test('should build, test and push when only build and push is true', async () => {
    delete process.env.INPUT_TEST

    await run()
    expect(exec.exec).toHaveBeenCalledTimes(3)
    expect(exec.exec).toHaveBeenNthCalledWith(1, 'make -C . build')
    expect(exec.exec).toHaveBeenNthCalledWith(2, 'make -C . lint')
    expect(exec.exec).toHaveBeenNthCalledWith(3, 'make -C . push')
  })

  test('should build when only buildis true', async () => {
    delete process.env.INPUT_LINT
    delete process.env.INPUT_TEST
    delete process.env.INPUT_PUSH

    await run()
    expect(exec.exec).toHaveBeenCalledTimes(1)
    expect(exec.exec).toHaveBeenNthCalledWith(1, 'make -C . build')
  })
})
