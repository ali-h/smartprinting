
import type { CustomThemeConfig } from '@skeletonlabs/tw-plugin';

export const main: CustomThemeConfig = {
    name: 'main',
    properties: {
		// =~= Theme Properties =~=
		"--theme-font-family-base": `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`,
		"--theme-font-family-heading": `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`,
		"--theme-font-color-base": "0 0 0",
		"--theme-font-color-dark": "255 255 255",
		"--theme-rounded-base": "9999px",
		"--theme-rounded-container": "8px",
		"--theme-border-base": "1px",
		// =~= Theme On-X Colors =~=
		"--on-primary": "255 255 255",
		"--on-secondary": "255 255 255",
		"--on-tertiary": "255 255 255",
		"--on-success": "0 0 0",
		"--on-warning": "0 0 0",
		"--on-error": "255 255 255",
		"--on-surface": "255 255 255",
		// =~= Theme Colors  =~=
		// primary | #0D6EFD 
		"--color-primary-50": "219 233 255", // #dbe9ff
		"--color-primary-100": "207 226 255", // #cfe2ff
		"--color-primary-200": "195 219 255", // #c3dbff
		"--color-primary-300": "158 197 254", // #9ec5fe
		"--color-primary-400": "86 154 254", // #569afe
		"--color-primary-500": "13 110 253", // #0D6EFD
		"--color-primary-600": "12 99 228", // #0c63e4
		"--color-primary-700": "10 83 190", // #0a53be
		"--color-primary-800": "8 66 152", // #084298
		"--color-primary-900": "6 54 124", // #06367c
		// secondary | #126b7d 
		"--color-secondary-50": "219 233 236", // #dbe9ec
		"--color-secondary-100": "208 225 229", // #d0e1e5
		"--color-secondary-200": "196 218 223", // #c4dadf
		"--color-secondary-300": "160 196 203", // #a0c4cb
		"--color-secondary-400": "89 151 164", // #5997a4
		"--color-secondary-500": "18 107 125", // #126b7d
		"--color-secondary-600": "16 96 113", // #106071
		"--color-secondary-700": "14 80 94", // #0e505e
		"--color-secondary-800": "11 64 75", // #0b404b
		"--color-secondary-900": "9 52 61", // #09343d
		// tertiary | #48cba4 
		"--color-tertiary-50": "228 247 241", // #e4f7f1
		"--color-tertiary-100": "218 245 237", // #daf5ed
		"--color-tertiary-200": "209 242 232", // #d1f2e8
		"--color-tertiary-300": "182 234 219", // #b6eadb
		"--color-tertiary-400": "127 219 191", // #7fdbbf
		"--color-tertiary-500": "72 203 164", // #48cba4
		"--color-tertiary-600": "65 183 148", // #41b794
		"--color-tertiary-700": "54 152 123", // #36987b
		"--color-tertiary-800": "43 122 98", // #2b7a62
		"--color-tertiary-900": "35 99 80", // #236350
		// success | #85f14b 
		"--color-success-50": "237 253 228", // #edfde4
		"--color-success-100": "231 252 219", // #e7fcdb
		"--color-success-200": "225 252 210", // #e1fcd2
		"--color-success-300": "206 249 183", // #cef9b7
		"--color-success-400": "170 245 129", // #aaf581
		"--color-success-500": "133 241 75", // #85f14b
		"--color-success-600": "120 217 68", // #78d944
		"--color-success-700": "100 181 56", // #64b538
		"--color-success-800": "80 145 45", // #50912d
		"--color-success-900": "65 118 37", // #417625
		// warning | #dfc649 
		"--color-warning-50": "250 246 228", // #faf6e4
		"--color-warning-100": "249 244 219", // #f9f4db
		"--color-warning-200": "247 241 210", // #f7f1d2
		"--color-warning-300": "242 232 182", // #f2e8b6
		"--color-warning-400": "233 215 128", // #e9d780
		"--color-warning-500": "223 198 73", // #dfc649
		"--color-warning-600": "201 178 66", // #c9b242
		"--color-warning-700": "167 149 55", // #a79537
		"--color-warning-800": "134 119 44", // #86772c
		"--color-warning-900": "109 97 36", // #6d6124
		// error | #df686a 
		"--color-error-50": "245 218 219", // #f5dadb
		"--color-error-100": "235 181 183", // #ebb5b7
		"--color-error-200": "225 144 147", // #e19093
		"--color-error-300": "215 107 111", // #d76b6f
		"--color-error-400": "205 70 75", // #cd464b
		"--color-error-500": "195 33 39", // #c32127
		"--color-error-600": "176 30 35", // #b01e23
		"--color-error-700": "146 25 29", // #92191d
		"--color-error-800": "117 20 23", // #751417
		"--color-error-900": "88 15 17", // #580f11
		/* surface | #2b2e3b */
		"--color-surface-50": "223 224 226", // #dfe0e2
		"--color-surface-100": "213 213 216", // #d5d5d8
		"--color-surface-200": "202 203 206", // #cacbce
		"--color-surface-300": "170 171 177", // #aaabb1
		"--color-surface-400": "107 109 118", // #6b6d76
		"--color-surface-500": "43 46 59", // #2b2e3b
		"--color-surface-600": "39 41 53", // #272935
		"--color-surface-700": "32 35 44", // #20232c
		"--color-surface-800": "26 28 35", // #1a1c23
		"--color-surface-900": "21 23 29", // #15171d
		
	}
}