function include (root, path, value) {
	var parts = path.split('.'),
		base = global,
		name;

	parts.unshift(root);
	while (parts.length > 1) {
		name = parts.shift();
		base = base[name] = base[name] || {};
	}

	base[parts[0]] = value;

	return value;
}

module.exports.include = include;