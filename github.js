// This file contains the GitHub repository configuration.
// It is intended to be environment-specific and should not be committed to Git.
const githubConfig = {
  repoName: "Case-Study-416"
};

// Make it available to the browser window
if (typeof window !== 'undefined') {
  window.githubConfig = githubConfig;
}