import * as core from '@actions/core'
import * as exec from '@actions/exec'

async function executeOperation(
  makeDir: string,
  operation: string
): Promise<void> {
  core.info(`executing ${operation}`)
  core.startGroup(`${operation}`)

  await exec.exec(`make -C ${makeDir} ${operation}`)

  core.endGroup()
}

export function setEnvironmentVariables(): void {
  if (
    process.env.GITHUB_REF === 'refs/heads/master' ||
    process.env.GITHUB_REF === 'refs/heads/main'
  ) {
    process.env.DOCKERIZED_FRIENDLY_GIT_BRANCH_NAME = 'latest'
  } else {
    const branchName = process.env.GITHUB_HEAD_REF

    if (!branchName) {
      throw new Error('GITHUB_HEAD_REF environment variable not set')
    }

    const dockerFriendlyGitBranchName = branchName.replace('/', '_')
    process.env.DOCKERIZED_FRIENDLY_GIT_BRANCH_NAME = dockerFriendlyGitBranchName
  }
}

export async function run(): Promise<void> {
  try {
    const build: boolean = core.getInput('build') === 'true'
    const lint: boolean = core.getInput('lint') === 'true'
    const test: boolean = core.getInput('test') === 'true'
    const push: boolean = core.getInput('push') === 'true'
    const makeDir: string = core.getInput('makeDir')

    setEnvironmentVariables()

    if (build) {
      await executeOperation(makeDir, 'build')
    }

    if (lint) {
      await executeOperation(makeDir, 'lint')
    }
    if (test) {
      await executeOperation(makeDir, 'test')
    }
    if (push) {
      await executeOperation(makeDir, 'push')
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
