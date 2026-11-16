function commitPartial(_context, commit) {
  const scope = commit.scope ? ` **${commit.scope}:**` : "";
  const subject = commit.subject || commit.header;
  const shortHash = commit.shortHash ? ` (${commit.shortHash})` : "";
  const body = commit.raw?.body?.trim();
  const formattedBody = body
    ? `\n\n  > ${body.replace(/\r?\n/g, "\n  > ")}\n`
    : "";

  return `${scope} ${subject}${shortHash}${formattedBody}`;
}

module.exports = {
  branches: ["main"],
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "conventionalcommits",
      },
    ],
    [
      "@semantic-release/release-notes-generator",
      {
        preset: "conventionalcommits",
        writerOpts: { commitPartial },
      },
    ],
    [
      "@semantic-release/github",
      {
        successComment:
          ":tada: This ${issue.pull_request ? 'PR is included' : 'issue is fixed'} in version ${nextRelease.version} :tada:\n\nThe release is available on [GitHub release](${releases.filter(release => /github\\.com/i.test(release.url))[0].url}) and as Helm chart `oci://ghcr.io/${process.env.GITHUB_REPOSITORY.toLowerCase()}:${nextRelease.version}`",
        releasedLabels: ["released"],
        addReleases: "bottom",
      },
    ],
  ],
};
