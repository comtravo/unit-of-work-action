jest.mock('@actions/exec')

import * as exec from '@actions/exec'
import {run} from '../src/main'

describe('run tests', () => {
  beforeEach(() => {
    process.env.GITHUB_REF = 'refs/heads/lorem/ipsum_foo+bar'
    process.env.INPUT_BUILD = 'true'
    process.env.INPUT_LINT = 'true'
    process.env.INPUT_TEST = 'true'
    process.env.INPUT_PUSH = 'true'
  })

  afterAll(() => {
    delete process.env.DOCKERIZED_FRIENDLY_GIT_BRANCH_NAME
    delete process.env.GITHUB_REF
    delete process.env.INPUT_BUILD
    delete process.env.INPUT_LINT
    delete process.env.INPUT_TEST
    delete process.env.INPUT_PUSH
  })

  test('should set the docker friendly branch name as docker tag when branch is not master', async () => {
    await run()
    expect(process.env.DOCKERIZED_FRIENDLY_GIT_BRANCH_NAME).toEqual(
      'lorem_ipsum_foo+bar'
    )
  })

  test('should set the docker tag as latest when branch is master', async () => {
    process.env.GITHUB_REF = 'refs/heads/master'

    await run()
    expect(process.env.DOCKERIZED_FRIENDLY_GIT_BRANCH_NAME).toEqual('latest')
  })

  test('should build, lint, test, push when all options provided', async () => {
    await run()
    expect(exec.exec).toHaveBeenCalledTimes(4)
    expect(exec.exec).toHaveBeenNthCalledWith(1, 'make build')
    expect(exec.exec).toHaveBeenNthCalledWith(2, 'make lint')
    expect(exec.exec).toHaveBeenNthCalledWith(3, 'make test')
    expect(exec.exec).toHaveBeenNthCalledWith(4, 'make push')
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
