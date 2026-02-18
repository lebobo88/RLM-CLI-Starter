#!/usr/bin/env bash
# Code Quality Check Library
# Reusable quality verification: function length, markers, minimum content
# Source this file: . "$(dirname "$0")/lib/code-quality-check.sh"

check_code_quality() {
    local project_dir="${1:-.}"
    local src_dir="$project_dir/src"
    local issues=0
    local issue_list=""

    if [ ! -d "$src_dir" ]; then
        echo "{\"issues\":[],\"passed\":true,\"checkedFiles\":0}"
        return 0
    fi

    # Check for incomplete markers
    for marker in TODO FIXME HACK XXX PLACEHOLDER; do
        local count
        count=$(grep -rl "\b${marker}\b" "$src_dir" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | wc -l)
        if [ "$count" -gt 0 ]; then
            issues=$((issues + count))
            issue_list="${issue_list}\"Marker $marker found in $count files\","
        fi
    done

    # Check for empty/stub files
    while IFS= read -r file; do
        local non_blank
        non_blank=$(grep -c '[^[:space:]]' "$file" 2>/dev/null || echo "0")
        if [ "$non_blank" -lt 5 ]; then
            issues=$((issues + 1))
            issue_list="${issue_list}\"File has fewer than 5 non-blank lines: $file\","
        fi
    done < <(find "$src_dir" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) ! -name "*.test.*" ! -name "*.spec.*" 2>/dev/null)

    # Remove trailing comma
    issue_list="${issue_list%,}"

    local passed="true"
    [ "$issues" -gt 0 ] && passed="false"

    local checked
    checked=$(find "$src_dir" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) ! -name "*.test.*" ! -name "*.spec.*" 2>/dev/null | wc -l)

    echo "{\"issues\":[$issue_list],\"passed\":$passed,\"checkedFiles\":$checked}"
}
