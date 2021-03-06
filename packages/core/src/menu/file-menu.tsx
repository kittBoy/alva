import * as Types from '@meetalva/types';
import { MessageType, Message } from '@meetalva/message';
import * as uuid from 'uuid';
import { FileInput } from '../container/file-input';
import * as React from 'react';
import * as Store from '../store';
import { AlvaApp } from '@meetalva/model';
import { MenuCreator } from './context';
import * as Mo from '@meetalva/model';

const ids = {
	file: uuid.v4(),
	new: uuid.v4(),
	open: uuid.v4(),
	newPage: uuid.v4(),
	save: uuid.v4(),
	saveAs: uuid.v4(),
	exportHTML: uuid.v4(),
	close: uuid.v4()
};

export const fileMenu: MenuCreator = ctx => {
	const hasProject = typeof ctx.project !== 'undefined';
	const onDetailView = ctx.app && ctx.app.isActiveView(Types.AlvaView.PageDetail);
	const isElectron = ctx.app && ctx.app.isHostType(Types.HostType.Electron);

	return {
		id: ids.file,
		label: '&File',
		submenu: [
			{
				id: ids.new,
				label: '&New',
				accelerator: 'CmdOrCtrl+N',
				click: app => {
					app.send({
						type: MessageType.CreateNewFileRequest,
						id: uuid.v4(),
						payload: {
							replace: false
						}
					});
				}
			},
			{
				id: ids.open,
				label: '&Open',
				accelerator: 'CmdOrCtrl+O',
				click: app => {
					app.send({
						type: MessageType.OpenFileRequest,
						id: uuid.v4(),
						payload: {
							replace: app.isActiveView(Types.AlvaView.SplashScreen)
						}
					});
				},
				// TODO: Inject more deps
				render: (props: {
					accelerator: JSX.Element | null;
					app: Mo.AlvaApp<Message>;
					style: React.CSSProperties;
					menu: Types.MenuItem<Mo.AlvaApp<Message>, Mo.Project>;
					menuStore: Store.MenuStore;
					onMouseEnter: React.MouseEventHandler<HTMLElement>;
					onMouseLeave: React.MouseEventHandler<HTMLElement>;
				}) => {
					return (
						<label
							style={props.style}
							onClick={e => e.stopPropagation()}
							onMouseEnter={props.onMouseEnter}
							onMouseLeave={props.onMouseLeave}
						>
							Open
							{/* Can't trigger file inputs programmatically: props.accelerator */}
							<FileInput
								accept=".alva"
								onChange={contents => {
									props.menuStore.clear();

									props.app.send({
										type: MessageType.UseFileRequest,
										id: uuid.v4(),
										payload: {
											silent: false,
											replace: props.app.isActiveView(Types.AlvaView.SplashScreen),
											contents
										}
									});
								}}
							/>
						</label>
					);
				}
			},
			{
				id: uuid.v4(),
				type: 'separator'
			},
			{
				id: ids.newPage,
				label: 'New &Page',
				enabled: hasProject && onDetailView,
				accelerator: 'CmdOrCtrl+Shift+N',
				click: app => {
					app.send({
						type: MessageType.CreateNewPage,
						id: uuid.v4(),
						payload: undefined
					});
				}
			},
			{
				id: uuid.v4(),
				type: 'separator'
			},
			{
				id: ids.save,
				label: '&Save',
				enabled: hasProject && onDetailView,
				accelerator: 'CmdOrCtrl+S',
				visible: isElectron,
				role: 'save',
				click: app => {
					if (!ctx.project) {
						return;
					}

					app.send({
						type: MessageType.Save,
						id: uuid.v4(),
						payload: {
							publish: ctx.project.getDraft(),
							projectId: ctx.project.getId()
						}
					});
				}
			},
			{
				id: ids.saveAs,
				label: '&Save As',
				enabled: hasProject && onDetailView,
				accelerator: 'CmdOrCtrl+Shift+S',
				role: 'save',
				click: async app => {
					if (!ctx.project) {
						return;
					}

					app.send({
						type: MessageType.SaveAs,
						id: uuid.v4(),
						payload: { projectId: ctx.project.getId() }
					});
				}
			},
			{
				id: uuid.v4(),
				type: 'separator'
			},
			{
				id: ids.exportHTML,
				label: 'Export Prototype as HTML',
				enabled: onDetailView && hasProject,
				accelerator: 'CmdOrCtrl+E',
				click: async app => {
					if (!ctx.project) {
						return;
					}

					app.send({
						id: uuid.v4(),
						type: MessageType.ExportHtmlProject,
						payload: { path: undefined, projectId: ctx.project.getId() }
					});
				}
			},
			{
				id: uuid.v4(),
				type: 'separator',
				visible: isElectron
			},
			{
				id: ids.close,
				label: '&Close',
				accelerator: 'CmdOrCtrl+W',
				role: 'close',
				visible: isElectron,
				click: async () => {
					if (!ctx.project) {
						return;
					}

					// TODO: Send CloseProject message
				}
			}
		]
	};
};
