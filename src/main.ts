import * as core from '@actions/core'
import * as exec from '@actions/exec'

async function executeOperation(operation: string): Promise<void> {
  core.info(`executing ${operation}`)
  core.startGroup(`${operation}`)

  await exec.exec(`make ${operation}`)

  core.endGroup()
}

function setEnvironmentVariables(): void {
  if (process.env.GITHUB_REF === 'refs/heads/master') {
    process.env.DOCKERIZED_FRIENDLY_GIT_BRANCH_NAME = 'latest'
  } else {
    const ref = process.env.GITHUB_REF as string
    const branchName = ref.split('refs/heads/')[1]
    const dockerFriendlyGitBranchName = branchName.replace('/', '_')

    if (!branchName) {
      throw new Error('unable to determine branch name')
    }
    process.env.DOCKERIZED_FRIENDLY_GIT_BRANCH_NAME = dockerFriendlyGitBranchName
  }
}

export async function run(): Promise<void> {
  try {
    const build: boolean = core.getInput('build') === 'true'
    const lint: boolean = core.getInput('lint') === 'true'
    const test: boolean = core.getInput('test') === 'true'
    const push: boolean = core.getInput('push') === 'true'

    setEnvironmentVariables()

    if (build) {
      await executeOperation('build')
    }

    if (lint) {
      await executeOperation('lint')
    }
    if (test) {
      await executeOperation('test')
    }
    if (push) {
      await executeOperation('push')
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
