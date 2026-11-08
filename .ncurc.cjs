module.exports = {
  target: (packageName) => {
    if (packageName === 'cdk-nag' || packageName === '@types/node') {
      return 'minor';
    }

    return 'latest';
  },
};
