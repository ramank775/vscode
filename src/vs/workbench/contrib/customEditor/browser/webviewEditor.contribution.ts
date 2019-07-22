/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as nls from 'vs/nls';
import { Extensions as ConfigurationExtensions, IConfigurationRegistry } from 'vs/platform/configuration/common/configurationRegistry';
import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { LifecyclePhase } from 'vs/platform/lifecycle/common/lifecycle';
import { Registry } from 'vs/platform/registry/common/platform';
import { EditorDescriptor, Extensions as EditorExtensions, IEditorRegistry } from 'vs/workbench/browser/editor';
import { Extensions as WorkbenchExtensions, IWorkbenchContributionsRegistry } from 'vs/workbench/common/contributions';
import { ICustomEditorService } from 'vs/workbench/contrib/customEditor/common/customEditor';
import './commands';
import { CustomEditorContribution, CustomEditorService, CustomFileEditorInput, CustomWebviewEditor } from './customEditors';
import { IJSONSchema } from 'vs/base/common/jsonSchema';
import { ExtensionsRegistry } from 'vs/workbench/services/extensions/common/extensionsRegistry';
import { languagesExtPoint } from 'vs/workbench/services/mode/common/workbenchModeService';


registerSingleton(ICustomEditorService, CustomEditorService);

const workbenchContributionsRegistry = Registry.as<IWorkbenchContributionsRegistry>(WorkbenchExtensions.Workbench);
workbenchContributionsRegistry.registerWorkbenchContribution(CustomEditorContribution, LifecyclePhase.Starting);

Registry.as<IEditorRegistry>(EditorExtensions.Editors).registerEditor(
	new EditorDescriptor(
		CustomWebviewEditor,
		CustomWebviewEditor.ID,
		'Custom Editor',
	), [
		new SyncDescriptor(CustomFileEditorInput)
	]);

// Configuration
(function registerConfiguration(): void {
	const registry = Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration);
	// Telemetry
	registry.registerConfiguration({
		'id': 'workbench',
		'order': 7,
		'title': nls.localize('workbenchConfigurationTitle', "Workbench"),
		'type': 'object',
		'properties': {
			'workbench.editor.custom': {
				'type': 'object',
				'description': nls.localize('editor.custom', "TODO."),
				'default': {}
			}
		}
	});
})();

interface IWebviewEditorsExtensionPoint {
	readonly viewType: string;
	readonly displayName: string;
	readonly extensions?: readonly string[];
}

const webviewEditorsContribution: IJSONSchema = {
	description: nls.localize('vscode.extension.contributes.webviewEditors', 'Contributes webview editors.'),
	type: 'array',
	defaultSnippets: [{ body: [{ viewType: '', displayName: '' }] }],
	items: {
		type: 'object',
		required: [
			'viewType',
			'displayName'
		],
		properties: {
			viewType: {
				description: nls.localize('vscode.extension.contributes.webviewEditors-viewType', 'XXX.'),
				type: 'string'
			},
			displayName: {
				description: nls.localize('vscode.extension.contributes.webviewEditors-displayName', 'XXX.'),
				type: 'string'
			},
			extensions: {
				type: 'array',
				description: nls.localize('vscode.extension.contributes.webviewEditors-extensions', 'XXX.'),
			}
		}
	}
};

export const contributionPoint = ExtensionsRegistry.registerExtensionPoint<IWebviewEditorsExtensionPoint[]>({
	extensionPoint: 'webviewEditors',
	deps: [languagesExtPoint],
	jsonSchema: webviewEditorsContribution
});
