const _ = require('lodash');
const {getClient} = require('./client');
const {compareBranches} = require('./client-repos');

module.exports.getBranchDiff = async function({org, repo}) {
  if (!await hasMasterAndDevelop({org, repo})) {
    return {org, repo, status: 'no-branch'};
  }

  const {status, ahead_by, behind_by, commits, base_commit} = await compareBranches({org, repo});

  const lastHeadCommitDate = _.get(commits.reverse(), '[0].commit.author.date', '');
  const lastBaseCommitDate = _.get(base_commit, 'commit.author.date', '');
  const lastCommitDate = lastHeadCommitDate || lastBaseCommitDate;

  return {org, repo, status, ahead_by, behind_by, lastCommitDate};
};

async function hasMasterAndDevelop({org, repo}) {
  const branches = await getRepoBranches({org, repo});
  return branches.includes('develop') && branches.includes('master');
}

async function getRepoBranches({org, repo}) {
  const gh = getClient();

  const branchesResponse = await gh.repos.getBranches({
    owner: org,
    repo,
    per_page: 100
  });

  return _.map(branchesResponse.data, 'name');
}
