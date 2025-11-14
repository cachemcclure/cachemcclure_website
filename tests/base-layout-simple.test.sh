#!/bin/bash

# BaseLayout Integration Tests (Simple version using curl)
# Tests to verify that the new BaseLayout component works correctly

BASE_URL="http://localhost:4321"
PASSED=0
FAILED=0

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🧪 Starting BaseLayout Integration Tests..."
echo ""

# Helper function to run tests
test_contains() {
    local test_name="$1"
    local pattern="$2"
    local page_html="$3"

    if echo "$page_html" | grep -i -q "$pattern"; then
        echo -e "${GREEN}✅${NC} $test_name"
        ((PASSED++))
    else
        echo -e "${RED}❌${NC} $test_name"
        echo "   Expected to find: $pattern"
        ((FAILED++))
    fi
}

# Fetch the homepage
echo "Fetching homepage..."
HOMEPAGE=$(curl -s "$BASE_URL")

if [ -z "$HOMEPAGE" ]; then
    echo -e "${RED}❌ Failed to fetch homepage${NC}"
    exit 1
fi

echo "Testing homepage structure..."
echo ""

# Run tests
test_contains "Homepage loads successfully" "<!doctype html" "$HOMEPAGE"
test_contains "Header component is present" "<header" "$HOMEPAGE"
test_contains "Footer component is present" "<footer" "$HOMEPAGE"
test_contains "Main content area with correct ID" 'id="main-content"' "$HOMEPAGE"
test_contains "Navigation contains Books link" 'href="/books"' "$HOMEPAGE"
test_contains "Navigation contains About link" 'href="/about"' "$HOMEPAGE"
test_contains "Meta charset is set" 'meta charset="UTF-8"' "$HOMEPAGE"
test_contains "Meta viewport is set" 'name="viewport"' "$HOMEPAGE"
test_contains "Meta description is set" 'name="description"' "$HOMEPAGE"
test_contains "Open Graph title tag" 'property="og:title"' "$HOMEPAGE"
test_contains "Open Graph description tag" 'property="og:description"' "$HOMEPAGE"
test_contains "Open Graph image tag" 'property="og:image"' "$HOMEPAGE"
test_contains "Twitter Card tag" 'property="twitter:card"' "$HOMEPAGE"
test_contains "Twitter title tag" 'property="twitter:title"' "$HOMEPAGE"
test_contains "Page title includes site name" "Cache McClure" "$HOMEPAGE"
test_contains "Canonical URL is set" 'rel="canonical"' "$HOMEPAGE"
test_contains "Favicon is linked" 'rel="icon"' "$HOMEPAGE"
test_contains "Structured data (JSON-LD) is present" 'type="application/ld+json"' "$HOMEPAGE"
test_contains "RSS feed is linked" 'type="application/rss+xml"' "$HOMEPAGE"
test_contains "Theme toggle script" 'src="/toggle-theme.js"' "$HOMEPAGE"
test_contains "Skip to content link (accessibility)" 'href="#main-content"' "$HOMEPAGE"
test_contains "HTML lang attribute" 'lang=' "$HOMEPAGE"
test_contains "HTML dir attribute" 'dir=' "$HOMEPAGE"
test_contains "Copyright year in footer" "$(date +%Y)" "$HOMEPAGE"

# Test site title
test_contains "Site title in header" "Cache McClure" "$HOMEPAGE"

# Test that Header and Footer are NOT duplicated
HEADER_COUNT=$(echo "$HOMEPAGE" | grep -c "<header" || echo "0")
FOOTER_COUNT=$(echo "$HOMEPAGE" | grep -c "<footer" || echo "0")

if [ "$HEADER_COUNT" -eq 1 ]; then
    echo -e "${GREEN}✅${NC} Exactly one header (no duplicates)"
    ((PASSED++))
else
    echo -e "${RED}❌${NC} Header count is $HEADER_COUNT (expected 1)"
    ((FAILED++))
fi

if [ "$FOOTER_COUNT" -eq 1 ]; then
    echo -e "${GREEN}✅${NC} Exactly one footer (no duplicates)"
    ((PASSED++))
else
    echo -e "${RED}❌${NC} Footer count is $FOOTER_COUNT (expected 1)"
    ((FAILED++))
fi

# Summary
echo ""
echo "=================================================="
echo -e "✅ Passed: ${GREEN}$PASSED${NC}"
echo -e "❌ Failed: ${RED}$FAILED${NC}"
echo "=================================================="

if [ $FAILED -gt 0 ]; then
    echo ""
    echo "Some tests failed."
    exit 1
else
    echo ""
    echo "🎉 All tests passed!"
    exit 0
fi
