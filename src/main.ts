import * as core from '@actions/core'
import * as exec from '@actions/exec'

async function executeOperation(operation: string): Promise<void> {
  core.info(`executing ${operation}`)
  core.startGroup(`${operation}`)

  await exec.exec(`make ${operation}`)

  core.endGroup()
}

export async function run(): Promise<void> {
  try {
    const build: boolean = core.getInput('build') === 'true'
    const lint: boolean = core.getInput('lint') === 'true'
    const test: boolean = core.getInput('test') === 'true'
    const push: boolean = core.getInput('push') === 'true'

    process.env.CT_BUILD_ENVIRONMENT = 'ct-jenkins'

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
