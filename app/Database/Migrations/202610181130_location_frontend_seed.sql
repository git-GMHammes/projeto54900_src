-- Seed do frontend do modulo Location: forms, listas, menu e rotas. Reaplicavel (apaga os ids proprios antes).
-- Aplicar: podman exec -i codeigniter54900_mysql sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" --default-character-set=utf8mb4 codeigniter54900_db' < este_arquivo.sql
SET NAMES utf8mb4;
START TRANSACTION;
DELETE FROM form_fields WHERE id BETWEEN 506 AND 533;
DELETE FROM form_rows WHERE id BETWEEN 276 AND 289;
DELETE FROM form_groups WHERE id BETWEEN 90 AND 93;
DELETE FROM form_manager WHERE id BETWEEN 67 AND 70;
DELETE FROM list_actions WHERE id BETWEEN 136 AND 145;
DELETE FROM list_columns WHERE id BETWEEN 347 AND 366;
DELETE FROM list_manager WHERE id IN (56,57);
DELETE FROM menu_manager WHERE id BETWEEN 72 AND 74;
DELETE FROM route_manager WHERE object IN ('location-manager','location-manager-view','location-types');
INSERT INTO form_manager (id,slug,table_name,title,description,roles,react_route,submit_endpoint,http_method,status,version) VALUES
(67,'criar-local','location_manager','Novo Local','Cadastra um local. O pai é opcional: vazio, o local fica no topo da árvore.','["user","admin"]','/v1/location-manager/create','/api/v1/location-manager/create','POST','active',1),
(68,'editar-local','location_manager','Editar Local','Altera nome, código, tipo, pai e coordenadas do local.','["user","admin"]','/v1/location-manager/update','/api/v1/location-manager/update','PUT','active',1),
(69,'criar-tipo-de-local','location_types','Novo Tipo de Local','Cadastra um tipo de local (code em inglês minúsculo).','["admin"]','/v1/location-types/create','/api/v1/location-types/create','POST','active',1),
(70,'editar-tipo-de-local','location_types','Editar Tipo de Local','Altera nome, ícone e ordem de grandeza do tipo.','["admin"]','/v1/location-types/update','/api/v1/location-types/update','PUT','active',1);
INSERT INTO form_groups (id,form_manager_id,title,sort_order,collapsed) VALUES
(90,67,'Local',1,0),
(91,68,'Local',1,0),
(92,69,'Tipo de local',1,0),
(93,70,'Tipo de local',1,0);
INSERT INTO form_rows (id,form_group_id,sort_order,gutter) VALUES
(276,90,1,'g-3'),
(277,90,2,'g-3'),
(278,90,3,'g-3'),
(279,90,4,'g-3'),
(280,90,5,'g-3'),
(281,91,1,'g-3'),
(282,91,2,'g-3'),
(283,91,3,'g-3'),
(284,91,4,'g-3'),
(285,91,5,'g-3'),
(286,92,1,'g-3'),
(287,92,2,'g-3'),
(288,93,1,'g-3'),
(289,93,2,'g-3');
INSERT INTO form_fields (id,form_row_id,sort_order,field_type,col,label,field_name,field_key,help_text,required,options_json,select_config_json) VALUES
(506,276,1,'select',4,'Tipo','location_type_id','location_type_id',NULL,1,NULL,'{"src": "/api/v1/location-types/get-no-pagination?sort=sort_order&order=asc", "valueKey": "id", "labelTemplate": "{name} ({code})"}'),
(507,276,2,'text',4,'Nome','name','name',NULL,1,NULL,NULL),
(508,276,3,'text',4,'Código','code','code','Único entre irmãos do mesmo pai.',0,NULL,NULL),
(509,277,1,'select',12,'Local pai','parent_id','parent_id','Vazio = topo da árvore.',0,NULL,'{"src": "/api/v1/location-manager-view/get-no-pagination?sort=path_names&order=asc", "valueKey": "id", "labelTemplate": "{path_names} #{id}"}'),
(510,278,1,'text',6,'Latitude','latitude','latitude',NULL,0,NULL,NULL),
(511,278,2,'text',6,'Longitude','longitude','longitude',NULL,0,NULL,NULL),
(512,279,1,'textarea',12,'Descrição','description','description',NULL,0,NULL,NULL),
(513,280,1,'text',6,'Ordem','sort_order','sort_order',NULL,0,NULL,NULL),
(514,280,2,'select',6,'Status','status','status',NULL,1,'[{"id": "opt_active", "label": "Ativo", "value": "active"}, {"id": "opt_inactive", "label": "Inativo", "value": "inactive"}]',NULL),
(515,281,1,'select',4,'Tipo','location_type_id','location_type_id',NULL,1,NULL,'{"src": "/api/v1/location-types/get-no-pagination?sort=sort_order&order=asc", "valueKey": "id", "labelTemplate": "{name} ({code})"}'),
(516,281,2,'text',4,'Nome','name','name',NULL,1,NULL,NULL),
(517,281,3,'text',4,'Código','code','code','Único entre irmãos do mesmo pai.',0,NULL,NULL),
(518,282,1,'select',12,'Local pai','parent_id','parent_id','Vazio = topo da árvore.',0,NULL,'{"src": "/api/v1/location-manager-view/get-no-pagination?sort=path_names&order=asc", "valueKey": "id", "labelTemplate": "{path_names} #{id}"}'),
(519,283,1,'text',6,'Latitude','latitude','latitude',NULL,0,NULL,NULL),
(520,283,2,'text',6,'Longitude','longitude','longitude',NULL,0,NULL,NULL),
(521,284,1,'textarea',12,'Descrição','description','description',NULL,0,NULL,NULL),
(522,285,1,'text',6,'Ordem','sort_order','sort_order',NULL,0,NULL,NULL),
(523,285,2,'select',6,'Status','status','status',NULL,1,'[{"id": "opt_active", "label": "Ativo", "value": "active"}, {"id": "opt_inactive", "label": "Inativo", "value": "inactive"}]',NULL),
(524,286,1,'text',4,'Código','code','code','Minúsculo, em inglês.',1,NULL,NULL),
(525,286,2,'text',8,'Nome','name','name',NULL,1,NULL,NULL),
(526,287,1,'text',6,'Ícone','icon','icon',NULL,0,NULL,NULL),
(527,287,2,'text',3,'Ordem de grandeza','sort_order','sort_order',NULL,0,NULL,NULL),
(528,287,3,'select',3,'Status','status','status',NULL,1,'[{"id": "opt_active", "label": "Ativo", "value": "active"}, {"id": "opt_inactive", "label": "Inativo", "value": "inactive"}]',NULL),
(529,288,1,'text',4,'Código','code','code','Minúsculo, em inglês.',1,NULL,NULL),
(530,288,2,'text',8,'Nome','name','name',NULL,1,NULL,NULL),
(531,289,1,'text',6,'Ícone','icon','icon',NULL,0,NULL,NULL),
(532,289,2,'text',3,'Ordem de grandeza','sort_order','sort_order',NULL,0,NULL,NULL),
(533,289,3,'select',3,'Status','status','status',NULL,1,'[{"id": "opt_active", "label": "Ativo", "value": "active"}, {"id": "opt_inactive", "label": "Inativo", "value": "inactive"}]',NULL);
INSERT INTO list_manager (id,slug,table_name,title,description,api_get_endpoint,api_search_endpoint,roles,default_sort,default_order,default_limit,limit_options_json,status,version) VALUES
(56,'location-manager','view_location_manager','Locais','Locais em árvore recursiva. O caminho mostra a hierarquia; Editar muda o pai.','/api/v1/location-manager-view/get-all','/api/v1/location-manager-view/search','["user","admin"]','path_names','asc',20,'[10, 20, 50, 100]','active',1),
(57,'location-types','location_types','Tipos de local','Rótulos de tipo, do maior ao menor (ordem de grandeza).','/api/v1/location-types/get-all','/api/v1/location-types/search','["admin"]','sort_order','asc',50,'[20, 50, 100]','active',1);
INSERT INTO list_columns (id,list_manager_id,sort_order,label,field_key,format,sortable,sort_key,visible) VALUES
(347,56,1,'Caminho','path_names','text',1,'path_names',1),
(348,56,2,'Nome','name','text',1,'name',1),
(349,56,3,'Tipo','type_name','text',1,'type_name',1),
(350,56,4,'Código','code','code',1,'code',1),
(351,56,5,'Nível','depth','text',1,'depth',1),
(352,56,6,'Filhos','children_count','text',1,'children_count',1),
(353,56,7,'Status','status','status-badge',1,'status',1),
(354,56,8,'Alterado em','updated_at','text',1,'updated_at',1),
(355,57,1,'Ordem','sort_order','text',1,'sort_order',1),
(356,57,2,'Nome','name','text',1,'name',1),
(357,57,3,'Código','code','code',1,'code',1),
(358,57,4,'Ícone','icon','text',1,'icon',1),
(359,57,5,'Status','status','status-badge',1,'status',1);
INSERT INTO list_actions (id,list_manager_id,sort_order,label,icon,action_type,href_template,api_endpoint,http_method,roles,business_rule_json,confirm,confirm_message) VALUES
(136,56,1,'Editar','pencil','link','/v1/location-manager/update/{id}',NULL,'GET','["user","admin"]',NULL,0,NULL),
(137,56,2,'Excluir','trash','api_call',NULL,'/api/v1/location-manager/delete-soft/{id}','DELETE','["user","admin"]','{"op": "eq", "hide": true, "field": "children_count", "value": "0"}',1,'Excluir este local? Locais com filhos não podem ser excluídos.'),
(140,56,3,'Ver','eye','link','/v1/location-manager/{id}',NULL,'GET','["user","admin"]',NULL,0,NULL),
(141,56,4,'Mapa','geo-alt','link','/v1/map/links/location-manager/{id}',NULL,'GET','["user","admin"]',NULL,0,NULL),
(138,57,1,'Editar','pencil','link','/v1/location-types/update/{id}',NULL,'GET','["admin"]',NULL,0,NULL),
(139,57,2,'Excluir','trash','api_call',NULL,'/api/v1/location-types/delete-soft/{id}','DELETE','["admin"]',NULL,1,'Excluir este tipo? Tipo em uso não pode ser excluído.');
INSERT INTO menu_manager (id,nav_manager_id,parent_id,title,react_route,icon,placement,is_bookmark,roles,sort_order,status) VALUES
(72,1,NULL,'Locais',NULL,'geo-alt','offcanvas',0,'["user","admin"]',66,'active'),
(73,1,72,'Locais','/v1/location-manager','diagram-3','offcanvas',0,'["user","admin"]',1,'active'),
(74,1,72,'Tipos de local','/v1/location-types','tags','offcanvas',0,'["admin"]',2,'active');
INSERT INTO route_manager (layer,object,action,method,endpoint,controller_method)
SELECT layer,'location-manager',action,method,REPLACE(endpoint,'company-manager','location-manager'),REPLACE(controller_method,'Company\\CompanyManager','Location\\LocationManager') FROM route_manager WHERE layer='backend' AND object='company-manager';
INSERT INTO route_manager (layer,object,action,method,endpoint,controller_method)
SELECT layer,'location-types',action,method,REPLACE(endpoint,'company-manager','location-types'),REPLACE(controller_method,'Company\\CompanyManager','Location\\LocationTypes') FROM route_manager WHERE layer='backend' AND object='company-manager';
INSERT INTO route_manager (layer,object,action,method,endpoint,controller_method)
SELECT layer,'location-manager-view',action,method,REPLACE(endpoint,'company-manager-view','location-manager-view'),REPLACE(controller_method,'Company\\CompanyManager','Location\\LocationManager') FROM route_manager WHERE layer='backend' AND object='company-manager-view';
INSERT INTO route_manager (layer,object,action,method,endpoint,controller_method) VALUES
('frontend','location-manager','list','GET','/v1/location-manager',NULL),
('frontend','location-manager','create','GET','/v1/location-manager/create',NULL),
('frontend','location-manager','update','GET','/v1/location-manager/update/:id',NULL),
('frontend','location-manager','view','GET','/v1/location-manager/:id',NULL),
('frontend','location-types','list','GET','/v1/location-types',NULL),
('frontend','location-types','create','GET','/v1/location-types/create',NULL),
('frontend','location-types','update','GET','/v1/location-types/update/:id',NULL);
COMMIT;
