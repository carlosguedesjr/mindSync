export class Permission {
  page: Page;
  role: PageRole;

  // PAGE
  static get getPages() {
    const list: {id: string; name: string}[] = [];
    for (const role of Object.entries(Page))
      list.push({id: role[0], name: Permission.getPage(role[1])});
    return list;
  }

  static getPage(role: Page): string {
    switch (role) {
      case Page.UserPage:
        return 'Usuário';
      case Page.GroupPage:
        return 'Grupo';
      case Page.CounponPage:
        return 'Cupom';
      case Page.StudentPage:
        return 'Aluno';
      case Page.CompanyPage:
        return 'Empresa';
      case Page.AccessPage:
        return 'Acessos ao conteúdo';
      case Page.AssessmentPage:
        return 'Assement';
      case Page.AssessmentGroupPage:
        return 'Assement Grupo';
      case Page.AssessmentQuestionPage:
        return 'Assement Questão';
      case Page.AssessmentInstructionPage:
        return 'Assement Instrução';
      case Page.ReportAssessmentPage:
        return 'Relatório Assessment';
    }
  }

  // PAGE ROLE
  static get getPageRoles() {
    const list: {id: string; name: string}[] = [];
    for (const role of Object.entries(PageRole))
      list.push({id: role[0], name: Permission.getPageRole(role[1])});
    return list;
  }

  static getPageRole(role: PageRole): string {
    switch (role) {
      case PageRole.CanAdd:
        return 'Permite adicionar';
      case PageRole.CanUpdate:
        return 'Permite editar';
      case PageRole.CanDelete:
        return 'Permite deletar';
      case PageRole.CanList:
        return 'Permite listar';
      case PageRole.CanView:
        return 'Permite visualizar';
    }
  }
}

export enum Page {
  UserPage = 'user-page',
  GroupPage = 'group-page',
  AccessPage = 'access-page',
  CounponPage = 'coupon-page',
  StudentPage = 'student-page',
  CompanyPage = 'company-page',
  AssessmentPage = 'assessment-page',
  ReportStudentPage = 'report-student-page',
  AssessmentGroupPage = 'assessment-group-page',
  ReportAssessmentPage = 'report-assessment-page',
  AssessmentQuestionPage = 'assessment-question-page',
  AssessmentInstructionPage = 'assessment-instruction-page'
}

export enum PageRole {
  CanList = 'can-list',
  CanView = 'can-view',
  CanAdd = 'can-add',
  CanUpdate = 'can-update',
  CanDelete = 'can-delete'
}
