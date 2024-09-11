// import { Gitgraph as GG } from '@gitgraph/react'

const colors = [
  '#929292',
  '#255db7',
  '#f3a138',
  '#bd461d',
  '#419bb2',
  '#ef754a',
  '#f6bb3f',
  '#53c1dd',
]

/**
 *
 * @param mode compact or normal
 * @param showCommitNumber
 * @param height
 * @param orientation
 * @param branchesOrder
 * @param children
 * @returns {JSX.Element}
 * @constructor
 */
export default function GitGraph({
  mode,
  maxHeight,
  overflow = 'auto',
  showCommitNumber = false,
  orientation,
  branchesOrder,
  children,
}) {
  return <>SDFSDF</>
  const template = templateExtend(TemplateName.Metro, {
    colors,
    commit: {
      hasTooltipInCompactMode: false,
      message: {
        displayAuthor: false,
      },
      dot: {
        font: '12px',
      },
    },
  })

  function compareBranchesOrder(a, b) {
    return branchesOrder.indexOf(a) - branchesOrder.indexOf(b)
  }

  // noinspection JSUnusedGlobalSymbols
  return (
    <div style={{ width: '100%', maxHeight, overflow, fill: 'white' }}>
      <GG
        options={{
          orientation,
          template,
          mode,
          compareBranchesOrder: branchesOrder ? compareBranchesOrder : null,
        }}
      >
        {(graph) => {
          let commitNumber = 0

          const branches = new Map()
          let currentBranch
          children
            .trim()
            .split('\n')
            .map((c) => c.trim())
            .filter((c) => c.length > 0 && c[0] !== '#')
            .forEach((command) => {
              const [commandName, ...args] = command.split(' ')
              switch (commandName) {
                case 'checkout':
                  checkout(args)
                  break
                case 'commit':
                  commit(args)
                  break
                case 'merge':
                  merge(args[0])
                  break
                case 'set_commit_num':
                  commitNumber = parseInt(args[0])
                  break
                default:
                  console.warn(`Unknown command: ${commandName}`)
              }
            })

          function checkout(branchNames) {
            branchNames.forEach((branchName, index) => {
              if (!branches.has(branchName)) {
                branches.set(
                  branchName,
                  graph.branch({
                    name: branchName,
                    from: currentBranch,
                  })
                )
              }

              // checkout last branch
              if (index === branchNames.length - 1) {
                currentBranch = branches.get(branchName)
              }
            })
          }

          function commit(args) {
            if (currentBranch) {
              currentBranch.commit({
                subject: args.join(' '),
                dotText: showCommitNumber ? `C${commitNumber}` : undefined,
              })
            }
            commitNumber++
          }

          function merge(sourceBranch) {
            if (branches.has(sourceBranch)) {
              currentBranch.merge(branches.get(sourceBranch))
            }
          }
        }}
      </GG>
    </div>
  )
}
