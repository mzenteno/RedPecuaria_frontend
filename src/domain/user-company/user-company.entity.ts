/** Vínculo usuario-empresa-rol — solo lo que hace falta para editar el rol
 * de un usuario en la empresa activa desde el diálogo de Usuarios. */
export interface UserCompanyLink {
  id: string;
  userId: string;
  companyId: string;
  roleId: string;
  createdAt: string;
}
