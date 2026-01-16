export default defineAppConfig({
	ui: {
		colors: {
			primary: 'blue',
			neutral: 'comet'
		},
		button: {
			slots: {
				base: 'rounded-lg'
			},
			defaultVariants: {
				size: 'sm'
			}
		},
		input: {
			slots: {
				base: 'rounded-lg'
			}
		},
		textarea: {
			slots: {
				base: 'rounded-lg'
			}
		},
		select: {
			slots: {
				base: 'rounded-lg'
			}
		},
		selectMenu: {
			slots: {
				base: 'rounded-lg'
			}
		},
		card: {
			slots: {
				root: 'rounded-lg'
			}
		},
		modal: {
			slots: {
				content: 'rounded-lg'
			}
		},
		dropdownMenu: {
			slots: {
				content: 'rounded-lg'
			},
			defaultVariants: {
				size: 'sm'
			}
		}
	}
})
