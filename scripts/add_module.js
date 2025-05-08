const fs = require("fs");
const { Octokit } = require("@octokit/rest");

const issue = JSON.parse(process.env.ISSUE_PAYLOAD);
const token = process.env.GITHUB_TOKEN;
const octokit = new Octokit({ auth: token });

async function processIssue() {
  if (issue.title.startsWith("[Add]")) {
  const body = issue.body;
  const urlMatch = body.match(/Repository URL: (https:\/\/github\.com\/[\w-]+\/[\w-]+)/);
  const nameMatch = body.match(/Module Name: ([^\n]+)/);
  const descriptionMatch = body.match(/Description: ([^\n]+)/);

  if (!urlMatch || !nameMatch) {
    await octokit.issues.createComment({
      owner: "REPO_OWNER",
      repo: "REPO_NAME",
      issue_number: issue.number,
      body: "⚠️ Invalid input: Module name and repository URL are required."
    });
    return;
  }

  const newModule = {
    name: nameMatch[1].trim(),
    "category": process.env.MODULE_CATEGORY,
    url: urlMatch[1].trim(),
    "id": process.env.MODULE_ID,
    "maintainer": process.env.MODULE_MAINTAINER,
    "maintainerURL": process.env.MODULE_MAINTAINER_URL,
    "description": descriptionMatch[1].trim()
  };

  // Read `modules.json` and add the module
  const modulesPath = "./modules.json";
  const modules = JSON.parse(fs.readFileSync(modulesPath, "utf8"));
  modules.push(newModule);
  fs.writeFileSync(modulesPath, JSON.stringify(modules, null, 2));

  const branchName = `add-module-${newModule.name.replace(/\s/g, "-")}`;

  // Create commit and pull request
  await octokit.git.createRef({
    owner: "REPO_OWNER",
    repo: "REPO_NAME",
    ref: `refs/heads/${branchName}`,
    sha: process.env.GITHUB_SHA
  });

  await octokit.pulls.create({
    owner: "REPO_OWNER",
    repo: "REPO_NAME",
    title: `Added new module: ${newModule.name}`,
    head: branchName,
    base: "main",
    body: `Automatically generated from issue #${issue.number}.\n\n${JSON.stringify(newModule, null, 2)}`
  });

  console.log(`✅ Pull request for module "${newModule.name}" created.`);
}
}

processIssue();
