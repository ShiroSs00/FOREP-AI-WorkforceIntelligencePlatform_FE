$ErrorActionPreference = "Continue"

$BaseUrl = "https://forep-ai-workforceintelligenceplatform.onrender.com"
$Stamp = Get-Date -Format "yyyyMMddHHmmss"
$Password = "CodexFullApi123!"
$OutJson = "reports/full_api_probe_$Stamp.json"
$OutTxt = "reports/full_api_probe_$Stamp.txt"

function New-Result($Group, $Name, $Method, $Path, $Ok, $Status, $Message, $Count = $null, $Details = $null) {
  [pscustomobject]@{
    group = $Group
    name = $Name
    method = $Method
    path = $Path
    ok = $Ok
    status = $Status
    message = $Message
    count = $Count
    details = $Details
  }
}

$Results = New-Object System.Collections.Generic.List[object]

function Get-Token($Response) {
  if ($null -eq $Response) { return $null }
  if ($Response.token) { return $Response.token }
  if ($Response.accessToken) { return $Response.accessToken }
  if ($Response.jwt) { return $Response.jwt }
  if ($Response.data) {
    if ($Response.data.token) { return $Response.data.token }
    if ($Response.data.accessToken) { return $Response.data.accessToken }
    if ($Response.data.jwt) { return $Response.data.jwt }
  }
  if ($Response.result) {
    if ($Response.result.token) { return $Response.result.token }
    if ($Response.result.accessToken) { return $Response.result.accessToken }
  }
  return $null
}

function Get-Data($Response) {
  if ($null -eq $Response) { return $null }
  if ($null -ne $Response.data) { return $Response.data }
  if ($null -ne $Response.result) { return $Response.result }
  if ($null -ne $Response.payload) { return $Response.payload }
  return $Response
}

function Get-Id($Obj) {
  if ($null -eq $Obj) { return $null }
  foreach ($k in @("id","employeeId","taskId","teamId","organizationId","projectId","sprintId","notificationId","commentId","membershipId")) {
    if ($Obj.PSObject.Properties.Name -contains $k -and $Obj.$k) { return [string]$Obj.$k }
  }
  return $null
}

function Get-Count($Response) {
  $data = Get-Data $Response
  if ($data -is [array]) { return $data.Count }
  if ($data -and $data.content -is [array]) { return $data.content.Count }
  if ($data -and $data.items -is [array]) { return $data.items.Count }
  return $null
}

function Invoke-Api($Group, $Name, $Method, $Path, $Token = $null, $Body = $null, $AllowFail = $true) {
  $headers = @{}
  if ($Token) { $headers.Authorization = "Bearer $Token" }
  $uri = "$BaseUrl$Path"
  try {
    $params = @{
      Uri = $uri
      Method = $Method
      Headers = $headers
      TimeoutSec = 45
    }
    if ($null -ne $Body) {
      $params.ContentType = "application/json"
      $params.Body = ($Body | ConvertTo-Json -Depth 20)
    }
    $response = Invoke-RestMethod @params
    $count = Get-Count $response
    $message = if ($response.message) { $response.message } else { "Success" }
    $Results.Add((New-Result $Group $Name $Method $Path $true 200 $message $count $null))
    return $response
  } catch {
    $status = $null
    if ($_.Exception.Response) {
      try { $status = [int]$_.Exception.Response.StatusCode } catch {}
    }
    $detail = $null
    if ($_.ErrorDetails.Message) { $detail = $_.ErrorDetails.Message }
    $msg = if ($detail) { $detail } else { $_.Exception.Message }
    $Results.Add((New-Result $Group $Name $Method $Path $false $status $msg $null $detail))
    if (-not $AllowFail) { throw }
    return $null
  }
}

function Register-And-Login($Role) {
  $roleLower = $Role.ToLowerInvariant()
  $email = "codex.fullapi.$roleLower.$Stamp@forep.test"
  $payload = @{
    firstName = "Codex"
    lastName = "Api$Role"
    email = $email
    password = $Password
    role = $Role
  }
  Invoke-Api "auth" "register $Role" "POST" "/api/v1/auth/register" $null $payload | Out-Null
  $login = Invoke-Api "auth" "login $Role" "POST" "/api/v1/auth/login" $null @{ email = $email; password = $Password }
  $token = Get-Token $login
  $me = Invoke-Api "auth" "me $Role" "GET" "/api/v1/auth/me" $token
  $meData = Get-Data $me
  return [pscustomobject]@{
    role = $Role
    email = $email
    token = $token
    me = $meData
    id = Get-Id $meData
    actualRole = if ($meData.role) { $meData.role } else { $null }
  }
}

$doc = Invoke-RestMethod -Uri "$BaseUrl/v3/api-docs" -TimeoutSec 90
$endpoints = @()
foreach ($p in $doc.paths.PSObject.Properties) {
  foreach ($m in $p.Value.PSObject.Properties) {
    $endpoints += [pscustomobject]@{ method = $m.Name.ToUpper(); path = $p.Name; operationId = $m.Value.operationId; tags = ($m.Value.tags -join ",") }
  }
}

$admin = Register-And-Login "ADMIN"
$manager = Register-And-Login "MANAGER"
$hr = Register-And-Login "HR"
$employee = Register-And-Login "EMPLOYEE"

$adminToken = $admin.token
$managerToken = $manager.token
$hrToken = $hr.token
$employeeToken = $employee.token

Invoke-Api "auth" "oauth2 links" "GET" "/api/v1/auth/oauth2/links" $adminToken | Out-Null
foreach ($oauth in @("github","google","jira")) {
  Invoke-Api "auth" "oauth2 $oauth redirect" "GET" "/api/v1/auth/oauth2/$oauth" $null | Out-Null
}

Invoke-Api "dashboard" "admin dashboard" "GET" "/api/v1/admin/dashboard" $adminToken | Out-Null

$org = Invoke-Api "organization" "create organization" "POST" "/api/v1/organizations" $adminToken @{
  name = "Codex Full API Org $Stamp"
  domain = "codex-$Stamp.test"
  logoUrl = "https://example.com/logo.png"
  latitude = 10.7769
  longitude = 106.7009
  allowedRadiusMeters = 500
}
$orgData = Get-Data $org
$orgId = Get-Id $orgData
Invoke-Api "organization" "list organizations" "GET" "/api/v1/organizations" $adminToken | Out-Null
if ($orgId) {
  Invoke-Api "organization" "get organization" "GET" "/api/v1/organizations/$orgId" $adminToken | Out-Null
  Invoke-Api "organization" "update organization" "PUT" "/api/v1/organizations/$orgId" $adminToken @{
    name = "Codex Full API Org Updated $Stamp"
    domain = "codex-updated-$Stamp.test"
    logoUrl = "https://example.com/logo-updated.png"
    latitude = 10.7769
    longitude = 106.7009
    allowedRadiusMeters = 650
  } | Out-Null
}

Invoke-Api "employee" "list employees" "GET" "/api/v1/employees" $adminToken | Out-Null
Invoke-Api "employee" "profile employee" "GET" "/api/v1/employees/profile" $employeeToken | Out-Null
Invoke-Api "employee" "update own profile" "PUT" "/api/v1/employees/profile" $employeeToken @{
  firstName = "Codex"
  lastName = "ApiEmployee"
  jobTitle = "QA Employee"
  phoneNumber = "0900000000"
  department = "QA"
  avatarInitials = "CE"
} | Out-Null
if ($employee.id) {
  Invoke-Api "employee" "get employee by id" "GET" "/api/v1/employees/$($employee.id)" $adminToken | Out-Null
}
if ($orgId) {
  Invoke-Api "employee" "employees by organization" "GET" "/api/v1/employees/organization/$orgId" $adminToken | Out-Null
}

$team = Invoke-Api "team" "create team" "POST" "/api/v1/teams" $adminToken @{
  name = "Codex Full API Team $Stamp"
  description = "Automated full API test team"
  organizationId = $orgId
  managerId = $manager.id
}
$teamData = Get-Data $team
$teamId = Get-Id $teamData
Invoke-Api "team" "list teams" "GET" "/api/v1/teams" $adminToken | Out-Null
Invoke-Api "team" "my managed teams" "GET" "/api/v1/teams/my-managed-teams" $managerToken | Out-Null
if ($teamId) {
  Invoke-Api "team" "get team" "GET" "/api/v1/teams/$teamId" $adminToken | Out-Null
  Invoke-Api "team" "update team" "PUT" "/api/v1/teams/$teamId" $adminToken @{
    name = "Codex Full API Team Updated $Stamp"
    description = "Updated automated team"
    organizationId = $orgId
    managerId = $manager.id
  } | Out-Null
  Invoke-Api "team" "teams by org" "GET" "/api/v1/teams/organization/$orgId" $adminToken | Out-Null
  Invoke-Api "team" "teams by manager" "GET" "/api/v1/teams/managed-by/$($manager.id)" $adminToken | Out-Null
  Invoke-Api "team" "assign employee" "PUT" "/api/v1/teams/$teamId/assign-employee" $adminToken @{ employeeId = $employee.id } | Out-Null
  Invoke-Api "team" "team members" "GET" "/api/v1/teams/$teamId/members" $adminToken | Out-Null
  Invoke-Api "team" "request join team" "POST" "/api/v1/teams/$teamId/members/request" $employeeToken | Out-Null
}
if ($employee.id) {
  Invoke-Api "team" "end active membership" "POST" "/api/v1/teams/members/$($employee.id)/end-active" $adminToken | Out-Null
}

$sprint = $null
$sprintId = $null
if ($orgId) {
  $sprint = Invoke-Api "sprint" "create sprint" "POST" "/api/v1/sprints" $adminToken @{
    name = "Codex Sprint $Stamp"
    goal = "Full API validation"
    startDate = "2026-06-20"
    endDate = "2026-07-04"
    organizationId = $orgId
    status = "ACTIVE"
  }
  $sprintData = Get-Data $sprint
  $sprintId = Get-Id $sprintData
}
Invoke-Api "sprint" "list sprints" "GET" "/api/v1/sprints" $adminToken | Out-Null
Invoke-Api "sprint" "active sprint" "GET" "/api/v1/sprints/active" $adminToken | Out-Null
if ($sprintId) {
  Invoke-Api "sprint" "get sprint" "GET" "/api/v1/sprints/$sprintId" $adminToken | Out-Null
  Invoke-Api "sprint" "update sprint" "PUT" "/api/v1/sprints/$sprintId" $adminToken @{
    name = "Codex Sprint Updated $Stamp"
    goal = "Updated validation"
    startDate = "2026-06-20"
    endDate = "2026-07-05"
    organizationId = $orgId
    status = "ACTIVE"
  } | Out-Null
  Invoke-Api "sprint" "sprints by org" "GET" "/api/v1/sprints/organization/$orgId" $adminToken | Out-Null
  Invoke-Api "sprint" "active sprint by org" "GET" "/api/v1/sprints/organization/$orgId/active" $adminToken | Out-Null
}

$project = $null
$projectId = $null
if ($orgId -and $teamId) {
  $project = Invoke-Api "project" "create project" "POST" "/api/v1/projects" $adminToken @{
    name = "Codex Project $Stamp"
    description = "Full API project"
    organizationId = $orgId
    teamId = $teamId
    projectKey = "CDX$($Stamp.Substring($Stamp.Length-5))"
    provider = "INTERNAL"
  }
  $projectData = Get-Data $project
  $projectId = Get-Id $projectData
}
if ($projectId) {
  Invoke-Api "project" "get project" "GET" "/api/v1/projects/$projectId" $adminToken | Out-Null
  Invoke-Api "project" "update project" "PUT" "/api/v1/projects/$projectId" $adminToken @{
    name = "Codex Project Updated $Stamp"
    description = "Updated full API project"
    organizationId = $orgId
    teamId = $teamId
    projectKey = "CDX$($Stamp.Substring($Stamp.Length-5))"
    provider = "INTERNAL"
  } | Out-Null
  Invoke-Api "project" "projects by org" "GET" "/api/v1/projects/organization/$orgId" $adminToken | Out-Null
  Invoke-Api "project" "projects by team" "GET" "/api/v1/projects/team/$teamId" $adminToken | Out-Null
}

$task = $null
$taskId = $null
if ($teamId -and $projectId) {
  $task = Invoke-Api "task" "create task" "POST" "/api/v1/tasks" $adminToken @{
    title = "Codex Task $Stamp"
    description = "Full API task"
    priority = "MEDIUM"
    dueDate = "2026-07-01T09:00:00"
    estimatedHours = 4
    assigneeId = $employee.id
    reporterId = $manager.id
    projectId = $projectId
    teamId = $teamId
    sprintId = $sprintId
    externalTicketRef = "CDX-$Stamp"
    sprintNumber = 1
    storyPoints = 3
    difficultyScore = 2
    progressPercent = 10
    leadEvaluation = "Initial test task"
    agentAssess = $false
  }
  $taskData = Get-Data $task
  $taskId = Get-Id $taskData
}
Invoke-Api "task" "list all tasks" "GET" "/api/v1/tasks" $adminToken | Out-Null
Invoke-Api "task" "my tasks" "GET" "/api/v1/tasks/my-tasks" $employeeToken | Out-Null
Invoke-Api "task" "managed team tasks" "GET" "/api/v1/tasks/managed-teams" $managerToken | Out-Null
if ($taskId) {
  Invoke-Api "task" "get task" "GET" "/api/v1/tasks/$taskId" $adminToken | Out-Null
  Invoke-Api "task" "update task" "PUT" "/api/v1/tasks/$taskId" $adminToken @{
    title = "Codex Task Updated $Stamp"
    description = "Updated full API task"
    priority = "HIGH"
    dueDate = "2026-07-02T09:00:00"
    estimatedHours = 5
    assigneeId = $employee.id
    reporterId = $manager.id
    projectId = $projectId
    teamId = $teamId
    sprintId = $sprintId
    externalTicketRef = "CDX-$Stamp"
    sprintNumber = 1
    storyPoints = 5
    difficultyScore = 3
    progressPercent = 40
    leadEvaluation = "Updated task"
    agentAssess = $false
  } | Out-Null
  Invoke-Api "task" "update status" "PATCH" "/api/v1/tasks/$taskId/status?status=IN_PROGRESS" $managerToken | Out-Null
  Invoke-Api "task" "assess task" "POST" "/api/v1/tasks/$taskId/assess" $managerToken | Out-Null
  Invoke-Api "task" "tasks by team" "GET" "/api/v1/tasks/team/$teamId" $adminToken | Out-Null
  Invoke-Api "task" "tasks by project" "GET" "/api/v1/tasks/project/$projectId" $adminToken | Out-Null
  Invoke-Api "task" "tasks by status" "GET" "/api/v1/tasks/status/IN_PROGRESS" $adminToken | Out-Null
  if ($sprintId) { Invoke-Api "task" "tasks by sprint" "GET" "/api/v1/tasks/sprint/$sprintId" $adminToken | Out-Null }
  Invoke-Api "task" "tasks by reporter" "GET" "/api/v1/tasks/reported-by/$($manager.id)" $adminToken | Out-Null
  Invoke-Api "task" "tasks by organization" "GET" "/api/v1/tasks/organization/$orgId" $adminToken | Out-Null
  Invoke-Api "task" "tasks by employee" "GET" "/api/v1/tasks/employee/$($employee.id)" $adminToken | Out-Null
  $comment = Invoke-Api "comment" "create task comment" "POST" "/api/v1/tasks/$taskId/comments" $employeeToken @{ content = "Codex full API comment $Stamp"; authorId = $employee.id }
  Invoke-Api "comment" "list task comments" "GET" "/api/v1/tasks/$taskId/comments" $employeeToken | Out-Null
  $commentId = Get-Id (Get-Data $comment)
  if ($commentId) { Invoke-Api "comment" "delete task comment" "DELETE" "/api/v1/tasks/$taskId/comments/$commentId" $employeeToken | Out-Null }
}

Invoke-Api "attendance" "check in" "POST" "/api/v1/attendance/check-in" $employeeToken @{ latitude = 10.7769; longitude = 106.7009 } | Out-Null
Invoke-Api "attendance" "check out" "POST" "/api/v1/attendance/check-out" $employeeToken @{ latitude = 10.7769; longitude = 106.7009 } | Out-Null
Invoke-Api "attendance" "my history" "GET" "/api/v1/attendance/my-history" $employeeToken | Out-Null
Invoke-Api "attendance" "managed teams history" "GET" "/api/v1/attendance/managed-teams" $managerToken | Out-Null
if ($teamId) { Invoke-Api "attendance" "team history" "GET" "/api/v1/attendance/team/$teamId" $adminToken | Out-Null }
if ($orgId) { Invoke-Api "attendance" "org history" "GET" "/api/v1/attendance/organization/$orgId" $adminToken | Out-Null }
if ($employee.id) { Invoke-Api "attendance" "employee history" "GET" "/api/v1/attendance/employee/$($employee.id)" $adminToken | Out-Null }

$leaveA = Invoke-Api "leave" "create leave approve candidate" "POST" "/api/v1/leaves" $employeeToken @{
  leaveType = "ANNUAL"
  startDate = "2026-07-08"
  endDate = "2026-07-09"
  reason = "Full API approve test"
}
$leaveAId = Get-Id (Get-Data $leaveA)
$leaveB = Invoke-Api "leave" "create leave reject candidate" "POST" "/api/v1/leaves" $employeeToken @{
  leaveType = "SICK"
  startDate = "2026-07-10"
  endDate = "2026-07-10"
  reason = "Full API reject test"
}
$leaveBId = Get-Id (Get-Data $leaveB)
Invoke-Api "leave" "all leave requests" "GET" "/api/v1/leaves" $hrToken | Out-Null
Invoke-Api "leave" "my leave history" "GET" "/api/v1/leaves/my-history" $employeeToken | Out-Null
Invoke-Api "leave" "managed team leaves" "GET" "/api/v1/leaves/managed-teams" $managerToken | Out-Null
Invoke-Api "leave" "leaves by status" "GET" "/api/v1/leaves/status/PENDING" $hrToken | Out-Null
if ($teamId) { Invoke-Api "leave" "leaves by team" "GET" "/api/v1/leaves/team/$teamId" $adminToken | Out-Null }
if ($orgId) { Invoke-Api "leave" "leaves by organization" "GET" "/api/v1/leaves/organization/$orgId" $adminToken | Out-Null }
if ($employee.id) { Invoke-Api "leave" "leaves by employee" "GET" "/api/v1/leaves/employee/$($employee.id)" $adminToken | Out-Null }
if ($leaveAId) { Invoke-Api "leave" "approve leave" "PUT" "/api/v1/leaves/$leaveAId/approve" $hrToken | Out-Null }
if ($leaveBId) { Invoke-Api "leave" "reject leave" "PUT" "/api/v1/leaves/$leaveBId/reject" $hrToken | Out-Null }

Invoke-Api "notification" "list notifications" "GET" "/api/v1/notifications" $adminToken | Out-Null
Invoke-Api "notification" "unread notifications" "GET" "/api/v1/notifications/unread" $adminToken | Out-Null
Invoke-Api "notification" "unread count" "GET" "/api/v1/notifications/unread-count" $adminToken | Out-Null
Invoke-Api "notification" "mark all read" "PUT" "/api/v1/notifications/read-all" $adminToken | Out-Null

if ($employee.id) { Invoke-Api "analytics" "employee workload" "GET" "/api/v1/analytics/workload-history/$($employee.id)" $adminToken | Out-Null }
Invoke-Api "analytics" "my workload" "GET" "/api/v1/analytics/workload-history/my-history" $employeeToken | Out-Null
Invoke-Api "analytics" "managed workload" "GET" "/api/v1/analytics/workload-history/managed-teams" $managerToken | Out-Null
if ($teamId) { Invoke-Api "analytics" "team workload" "GET" "/api/v1/analytics/workload-history/team/$teamId" $adminToken | Out-Null }
if ($orgId) { Invoke-Api "analytics" "org workload" "GET" "/api/v1/analytics/workload-history/organization/$orgId" $adminToken | Out-Null }

Invoke-Api "ai" "runtime status" "GET" "/api/v1/ai/runtime-status" $adminToken | Out-Null
Invoke-Api "ai" "all suggestions" "GET" "/api/v1/ai/suggestions" $adminToken | Out-Null
Invoke-Api "ai" "managed suggestions" "GET" "/api/v1/ai/suggestions/managed-teams" $managerToken | Out-Null
if ($employee.id) { Invoke-Api "ai" "employee suggestions" "GET" "/api/v1/ai/suggestions/employee/$($employee.id)" $adminToken | Out-Null }
if ($teamId) { Invoke-Api "ai" "team suggestions" "GET" "/api/v1/ai/suggestions/team/$teamId" $adminToken | Out-Null }
if ($orgId) { Invoke-Api "ai" "org suggestions" "GET" "/api/v1/ai/suggestions/organization/$orgId" $adminToken | Out-Null }
Invoke-Api "ai" "my insights" "GET" "/api/v1/ai/insights/my-insights" $employeeToken | Out-Null
Invoke-Api "ai" "managed insights" "GET" "/api/v1/ai/insights/managed-teams" $managerToken | Out-Null
if ($employee.id) {
  Invoke-Api "ai" "employee insights" "GET" "/api/v1/ai/insights/$($employee.id)" $adminToken | Out-Null
  Invoke-Api "ai" "generate insight" "POST" "/api/v1/ai/generate/$($employee.id)" $adminToken | Out-Null
}
if ($teamId) { Invoke-Api "ai" "team insights" "GET" "/api/v1/ai/insights/team/$teamId" $adminToken | Out-Null }
if ($orgId) { Invoke-Api "ai" "org insights" "GET" "/api/v1/ai/insights/organization/$orgId" $adminToken | Out-Null }

$githubConfig = $null
$jiraConfig = $null
if ($teamId -and $projectId) {
  $githubConfig = Invoke-Api "integration" "create github config" "POST" "/api/v1/integrations" $adminToken @{
    teamId = $teamId
    projectId = $projectId
    provider = "GITHUB"
    webhookSecret = "codex-secret-$Stamp"
    accessToken = "test-token"
    projectKey = "owner/repo"
    jiraDomain = ""
    isActive = $true
  }
  $jiraConfig = Invoke-Api "integration" "create jira config" "POST" "/api/v1/integrations" $adminToken @{
    teamId = $teamId
    projectId = $projectId
    provider = "JIRA"
    webhookSecret = "codex-secret-$Stamp"
    accessToken = "test-token"
    projectKey = "CDX"
    jiraDomain = "codex.atlassian.net"
    isActive = $true
  }
  Invoke-Api "integration" "configs by team" "GET" "/api/v1/integrations/team/$teamId" $adminToken | Out-Null
  Invoke-Api "integration" "runtime status" "GET" "/api/v1/integrations/runtime-status" $adminToken | Out-Null
}
$githubId = Get-Id (Get-Data $githubConfig)
$jiraId = Get-Id (Get-Data $jiraConfig)
if ($githubId) {
  Invoke-Api "integration" "update github config" "PUT" "/api/v1/integrations/$githubId" $adminToken @{
    teamId = $teamId
    projectId = $projectId
    provider = "GITHUB"
    webhookSecret = "codex-secret-updated-$Stamp"
    accessToken = "test-token"
    projectKey = "owner/repo"
    jiraDomain = ""
    isActive = $true
  } | Out-Null
  Invoke-Api "integration" "sync github" "POST" "/api/v1/integrations/$githubId/sync" $adminToken | Out-Null
  Invoke-Api "integration" "github sync logs" "GET" "/api/v1/integrations/$githubId/sync-logs" $adminToken | Out-Null
  Invoke-Api "webhook" "github webhook" "POST" "/api/v1/webhooks/github/$githubId" $null @{
    action = "closed"
    pull_request = @{
      merged = $true
      title = "Codex PR $Stamp"
      html_url = "https://github.com/example/repo/pull/1"
      user = @{ login = "codex" }
      merged_at = "2026-06-20T00:00:00Z"
    }
    repository = @{ full_name = "owner/repo" }
  } | Out-Null
}
if ($jiraId) {
  Invoke-Api "integration" "sync jira" "POST" "/api/v1/integrations/$jiraId/sync" $adminToken | Out-Null
  Invoke-Api "integration" "jira sync logs" "GET" "/api/v1/integrations/$jiraId/sync-logs" $adminToken | Out-Null
  Invoke-Api "webhook" "jira webhook" "POST" "/api/v1/webhooks/jira/$jiraId" $null @{
    webhookEvent = "jira:issue_updated"
    issue = @{
      key = "CDX-$Stamp"
      fields = @{
        summary = "Codex Jira task $Stamp"
        description = "Created by full API probe"
        status = @{ name = "Done" }
        priority = @{ name = "Medium" }
      }
    }
  } | Out-Null
}

if ($githubId) { Invoke-Api "integration" "delete github config" "DELETE" "/api/v1/integrations/$githubId" $adminToken | Out-Null }
if ($jiraId) { Invoke-Api "integration" "delete jira config" "DELETE" "/api/v1/integrations/$jiraId" $adminToken | Out-Null }
if ($taskId) { Invoke-Api "task" "delete task" "DELETE" "/api/v1/tasks/$taskId" $adminToken | Out-Null }
if ($sprintId) { Invoke-Api "sprint" "delete sprint" "DELETE" "/api/v1/sprints/$sprintId" $adminToken | Out-Null }
$emptyOrg = Invoke-Api "organization" "create deletable organization" "POST" "/api/v1/organizations" $adminToken @{
  name = "Codex Deletable Org $Stamp"
  domain = "codex-delete-$Stamp.test"
  logoUrl = "https://example.com/logo.png"
  latitude = 10.7769
  longitude = 106.7009
  allowedRadiusMeters = 100
}
$emptyOrgId = Get-Id (Get-Data $emptyOrg)
if ($emptyOrgId) { Invoke-Api "organization" "delete empty organization" "DELETE" "/api/v1/organizations/$emptyOrgId" $adminToken | Out-Null }

Invoke-Api "auth" "logout admin" "POST" "/api/v1/auth/logout" $adminToken | Out-Null
Invoke-Api "auth" "logout manager" "POST" "/api/v1/auth/logout" $managerToken | Out-Null
Invoke-Api "auth" "logout hr" "POST" "/api/v1/auth/logout" $hrToken | Out-Null
Invoke-Api "auth" "logout employee" "POST" "/api/v1/auth/logout" $employeeToken | Out-Null

$covered = @{}
foreach ($r in $Results) {
  $covered["$($r.method) $($r.path)"] = $true
}
$endpointRows = foreach ($e in $endpoints) {
  $key = "$($e.method) $($e.path)"
  [pscustomobject]@{
    method = $e.method
    path = $e.path
    operationId = $e.operationId
    tags = $e.tags
    covered = [bool]$covered[$key]
  }
}

$summary = [pscustomobject]@{
  testedAt = (Get-Date).ToString("s")
  baseUrl = $BaseUrl
  swaggerEndpointCount = $endpoints.Count
  probeCount = $Results.Count
  pass = ($Results | Where-Object { $_.ok }).Count
  fail = ($Results | Where-Object { -not $_.ok }).Count
  accounts = @{
    admin = @{ email = $admin.email; expectedRole = "ADMIN"; actualRole = $admin.actualRole; employeeId = $admin.id }
    manager = @{ email = $manager.email; expectedRole = "MANAGER"; actualRole = $manager.actualRole; employeeId = $manager.id }
    hr = @{ email = $hr.email; expectedRole = "HR"; actualRole = $hr.actualRole; employeeId = $hr.id }
    employee = @{ email = $employee.email; expectedRole = "EMPLOYEE"; actualRole = $employee.actualRole; employeeId = $employee.id }
  }
  context = @{
    organizationId = $orgId
    teamId = $teamId
    projectId = $projectId
    sprintId = $sprintId
    taskId = $taskId
  }
  results = $Results
  swaggerCoverage = $endpointRows
}

$summary | ConvertTo-Json -Depth 30 | Set-Content -Path $OutJson -Encoding UTF8

$lines = @()
$lines += "FOREP Full API Probe - $($summary.testedAt)"
$lines += "Base URL: $BaseUrl"
$lines += "Swagger endpoints: $($summary.swaggerEndpointCount)"
$lines += "Probe calls: $($summary.probeCount)"
$lines += "PASS: $($summary.pass)"
$lines += "FAIL: $($summary.fail)"
$lines += ""
$lines += "Accounts:"
$summary.accounts.PSObject.Properties | ForEach-Object { $lines += "- $($_.Name): $($_.Value.email) expected=$($_.Value.expectedRole) actual=$($_.Value.actualRole) employeeId=$($_.Value.employeeId)" }
$lines += ""
$lines += "Failures:"
foreach ($f in ($Results | Where-Object { -not $_.ok })) {
  $lines += "- [$($f.status)] $($f.group) / $($f.name): $($f.method) $($f.path) :: $($f.message)"
}
$lines += ""
$lines += "Untested Swagger operations:"
foreach ($u in ($endpointRows | Where-Object { -not $_.covered })) {
  $lines += "- $($u.method) $($u.path) ($($u.operationId))"
}
$lines | Set-Content -Path $OutTxt -Encoding UTF8

Write-Output "JSON=$OutJson"
Write-Output "TXT=$OutTxt"
Write-Output "PASS=$($summary.pass) FAIL=$($summary.fail) PROBES=$($summary.probeCount) SWAGGER=$($summary.swaggerEndpointCount)"
